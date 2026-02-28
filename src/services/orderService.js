// src/services/orderService.js
const orderRepo = require('../data/orderRepo');
const productRepo = require('../data/productRepo');
const bidRepo = require('../data/bidRepo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mailer = require('../utils/mailer');
const shippingService = require('./shippingService');
const bidStatusses = require('../utils/bidStatusses');

const {
    PLATFORM_FEE_PERCENT,
    AUTHENTICATION_FEE,
    AUTH_THRESHOLD
} = require('../utils/platformSettings');


// ⭐ Dansk kommentar: Validering af købers adresse
function validateAddress(address) {
    if (!address) throw new Error("A shipping address is required.");

    if (!address.name) throw new Error("Full name is required.");
    if (!address.street) throw new Error("Street address is required.");
    if (!address.city) throw new Error("City is required.");
    if (!address.zip || !/^\d{4}$/.test(address.zip)) {
        throw new Error("Zip code must be 4 digits.");
    }
    if (!address.country) throw new Error("Country is required.");

    return true;
}


// ⭐ initiateOrder kræver nu adresse fra frontend
async function initiateOrder(productId, buyerId, address, bidId = null, wantAuth = false) {

    // ⭐ Valider adresse INDEN noget andet
    validateAddress(address);

    // 1. Hent produktet og valider status
    const product = await productRepo.getProductById(productId);
    if (!product || product.status !== 'Approved') {
        throw new Error("This product is not available for purchase.");
    }

    // Valider sælger adresse:
    const seller = product.seller;

    if (!seller.profile?.address?.street ||
        !seller.profile?.address?.houseNumber ||
        !seller.profile?.address?.city ||
        !seller.profile?.address?.zip ||
        !seller.profile?.address?.country) {
        throw new Error("The seller has not completed their address. This product cannot be purchased at the moment.");
    }


    let finalPrice = product.price;

    // 2. Valider bud hvis et bidId er medsendt
    if (bidId) {
        const bid = await bidRepo.getBidById(bidId);
        if (!bid || bid.productId.toString() !== productId.toString()) {
            throw new Error("This offer is no longer valid for this product.");
        }
        if (bid.status !== bidStatusses.accepted) {
            throw new Error("This offer has not been accepted by the seller.");
        }
        if (bid.buyerId.toString() !== buyerId.toString()) {
            throw new Error("This offer does not belong to your account.");
        }
        finalPrice = bid.counterAmount || bid.amount;
    }

    // 3. Authentication logik
    const isAuthForced = finalPrice >= AUTH_THRESHOLD;
    const requiresAuthentication = isAuthForced || wantAuth;
    const currentAuthFee = requiresAuthentication ? AUTHENTICATION_FEE : 0;

    // 4. Beregn økonomi
    const platformFee = Math.round(finalPrice * (PLATFORM_FEE_PERCENT / 100));
    const sellerPayout = finalPrice - platformFee;
    const totalAmount = finalPrice + currentAuthFee;

    // 5. Forbered ordre-data
    const orderData = {
        product: productId,
        buyer: buyerId,
        seller: product.seller._id,
        totalAmount,
        platformFee,
        sellerPayout,
        requiresAuthentication,
        authenticationFee: currentAuthFee,
        authenticationStatus: requiresAuthentication ? 'pending' : 'not_required',
        status: 'pending',

        // ⭐ Gem køberens adresse direkte på ordren
        shippingAddress: address
    };

    // 6. Opret ordren
    const order = await orderRepo.createOrder(orderData);

    // 7. Opret Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100,
        currency: 'dkk',
        capture_method: 'manual',
        application_fee_amount: platformFee * 100,
        transfer_data: {
            destination: product.seller.stripeAccountId
        },
        metadata: {
            orderId: order._id.toString(),
            productId: productId.toString(),
            buyerId: buyerId.toString(),
            sellerId: product.seller._id.toString()
        }
    });

    // 8. Gem PaymentIntent ID
    await orderRepo.updateOrderSession(order._id, paymentIntent.id);

    return {
        order,
        clientSecret: paymentIntent.client_secret
    };
}


async function getUserOrders(userId) {
    const orders = await orderRepo.getOrdersByBuyer(userId);
    return orders.map(order => {
        const orderObj = order.toObject();
        if (order.deliveredAt) {
            const now = new Date();
            orderObj.isReclamable = now <= order.payoutEligibleAt;
        }
        return orderObj;
    });
}


async function processEligiblePayouts() {
    const now = new Date();
    const eligibleOrders = await orderRepo.findOrdersReadyForPayout(now);

    for (const order of eligibleOrders) {
        try {
            console.log(`🤖 Cron: Capturing PaymentIntent for order ${order._id}`);
            const capture = await stripe.paymentIntents.capture(order.stripePaymentIntentId);
            await orderRepo.updateOrderAsPaidOut(order._id, capture.id);
            console.log(`✅ PaymentIntent captured and paid out for order: ${order._id}`);
        } catch (error) {
            console.error(`❌ Error capturing PaymentIntent for order ${order._id}:`, error.message);
        }
    }
}


async function openOrderDispute(orderId, userId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found.");

    if (order.buyer._id.toString() !== userId.toString()) {
        throw new Error("You are not allowed to dispute this order.");
    }

    if (order.status !== 'delivered') {
        throw new Error("You can only dispute an order after it has been marked as delivered.");
    }

    if (new Date() > order.payoutEligibleAt) {
        throw new Error("The 72-hour dispute window has expired.");
    }

    return await orderRepo.disputeOrder(orderId);
}


// ⭐ Stripe-adresse ignoreres nu — vi bruger KUN vores egen adresse
async function handlePaymentIntentSucceeded(intent) {
    const orderId = intent.metadata.orderId;
    if (!orderId) throw new Error("Missing orderId in PaymentIntent metadata.");

    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found.");

    // 1. Opdater ordren til 'paid' — behold vores egen adresse
    const updatedOrder = await orderRepo.updateOrderStatusWithAddress(orderId, {
        status: 'paid',
        shippingAddress: order.shippingAddress,
        stripePaymentIntentId: intent.id
    });

    // 2. Opret fragtlabel hos Shipmondo
    try {
        console.log(`Requesting Shipmondo label for order: ${orderId}`);
        await shippingService.createShipmondoLabel(orderId);
        console.log(`✅ Shipmondo label created and saved on order.`);
    } catch (shippingError) {
        console.error(`❌ Shipmondo error for order ${orderId}:`, shippingError.message);

        await orderRepo.updateOrderShipping(orderId, {
            trackingNumber: 'ERROR',
            labelUrl: null,
            externalId: `ERROR: ${shippingError.message}`
        });

        try {
            await mailer.send({
                to: process.env.ADMIN_EMAIL,
                subject: `⚠️ Shipmondo label creation failed (Order: ${orderId})`,
                html: `
                    <h2>Shipping label could not be created</h2>
                    <p>Order: <strong>${orderId}</strong></p>
                    <p>Error: ${shippingError.message}</p>
                `
            });
        } catch (mailErr) {
            console.error("Failed to send admin error email:", mailErr.message);
        }
    }

    return updatedOrder;
}


module.exports = {
    initiateOrder,
    getUserOrders,
    processEligiblePayouts,
    openOrderDispute,
    handlePaymentIntentSucceeded,
};

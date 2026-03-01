// src/services/orderService.js
const orderRepo = require('../data/orderRepo');
const productRepo = require('../data/productRepo');
const bidRepo = require('../data/bidRepo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mailer = require('../utils/mailer');
const shippingService = require('./shippingService');
const bidStatusses = require('../utils/bidStatusses');
const userRepo = require('../data/userRepo');


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
    if (!address.houseNumber) throw new Error("House number is required.");
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
    await orderRepo.updateOrderPaymentIntentId(order._id, paymentIntent.id);

    return {
        order,
        clientSecret: paymentIntent.client_secret
    };
}

async function getOrderById(orderId, userId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found.");

    // Køberen må kun se sine egne ordrer
    if (order.buyer._id.toString() !== userId.toString()) {
        throw new Error("You are not allowed to view this order.");
    }

    return order;
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

            if (order.requiresAuthentication) {
                // Auth ikke færdig → skip
                if (order.authenticationStatus !== 'passed') {
                    console.log(`⏸ Skipping payout for order ${order._id} – auth not passed`);
                    continue;
                }

                // Auth passed, men varen ikke leveret → skip
                if (order.status !== 'delivered') {
                    console.log(`⏸ Skipping payout for order ${order._id} – not delivered yet`);
                    continue;
                }
            }

            console.log(`🤖 Cron: Capturing PaymentIntent for order ${order._id}`);
            const capture = await stripe.paymentIntents.capture(order.stripePaymentIntentId);
            await orderRepo.updateOrderAsPaidOut(order._id, capture.id);
            console.log(`✅ PaymentIntent captured and paid out for order: ${order._id}`);
        } catch (error) {
            console.error(`❌ Error capturing PaymentIntent for order ${order._id}:`, error.message);
        }
    }
}


async function openOrderDispute(orderId, userId, reason = "") {
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

    // 1) Sæt status + gem begrundelse
    const updatedOrder = await orderRepo.markOrderAsDisputed(orderId, reason);

    // 2) Find alle admins
    const admins = await userRepo.findAdmins();

    // 3) Mail til admins
    for (const admin of admins) {
        try {
            await mailer.send({
                to: admin.email,
                subject: `New dispute opened (Order ${orderId})`,
                html: `
                    <p>A buyer has opened a dispute.</p>
                    <p>Order: <strong>${orderId}</strong></p>
                    <p>Reason: ${reason || 'No reason provided.'}</p>
                `
            });
        } catch (err) {
            console.error("Failed to notify admin about dispute:", err.message);
        }
    }

    // 4) Mail til køber
    try {
        await mailer.send({
            to: order.buyer.email,
            subject: "Your dispute has been registered",
            html: `
                <p>Your dispute for order <strong>${orderId}</strong> has been registered.</p>
                <p>Our team will review your case as soon as possible.</p>
            `
        });
    } catch (err) {
        console.error("Failed to notify buyer about dispute:", err.message);
    }

    // 5) Mail til sælger
    try {
        await mailer.send({
            to: order.seller.email,
            subject: "A buyer has opened a dispute on your order",
            html: `
                <p>The buyer has opened a dispute for order <strong>${orderId}</strong>.</p>
                <p>Payout is currently on hold until the case is resolved.</p>
            `
        });
    } catch (err) {
        console.error("Failed to notify seller about dispute:", err.message);
    }

    return updatedOrder;
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
async function getUserSales(userId) {
    const sales = await orderRepo.getOrdersBySeller(userId);

    return sales.map(order => {
        const orderObj = order.toObject();

        // Beregn om ordren er låst (under 72 timer efter levering)
        if (order.status === 'delivered' && order.payoutEligibleAt) {
            const now = new Date();
            orderObj.payoutLocked = now < order.payoutEligibleAt;
        }

        return orderObj;
    });
}
async function handleShipmondoWebhook(payload) {
    const data = payload.data;
    if (!data) throw new Error("Invalid Shipmondo payload");

    const shipmondoOrderId = data.order_id;
    const status = data.order_status?.trim().toLowerCase();

    // Vi reagerer kun på leveret
    if (status !== "delivered") return;

    const order = await orderRepo.findByShipmondoOrderId(shipmondoOrderId);
    if (!order) throw new Error("Order not found for Shipmondo order_id");

    order.status = "delivered";
    order.deliveredAt = new Date();
    order.payoutEligibleAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await order.save();
}
async function approveDelivery(orderId, userId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found.");

    // Kun køberen må godkende levering
    if (order.buyer._id.toString() !== userId.toString()) {
        throw new Error("You are not allowed to approve this delivery.");
    }

    // Kun hvis ordren er leveret
    if (order.status !== 'delivered') {
        throw new Error("You can only approve a delivered order.");
    }

    // Stripe capture
    const capture = await stripe.paymentIntents.capture(order.stripePaymentIntentId);

    // Opdater ordre
    return await orderRepo.approveDelivery(orderId, capture.id);
}



module.exports = {
    initiateOrder,
    getUserOrders,
    processEligiblePayouts,
    openOrderDispute,
    handlePaymentIntentSucceeded,
    getOrderById,
    getUserSales,
    handleShipmondoWebhook,
    approveDelivery
};

// src/services/orderService.js
const orderRepo = require('../data/orderRepo');
const productRepo = require('../data/productRepo');
const bidRepo = require('../data/bidRepo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mailer = require('../utils/mailer');
const shippingService = require('./shippingService');
const bidStatusses = require('../utils/bidStatusses');
const userRepo = require('../data/userRepo');
const notificationService = require('../services/notificationService');
const notificationTypes = require('../utils/notificationTypes');
const chatService = require('../services/chatService');
const discountCodeService = require('../services/discountCodeService');
require('dotenv').config();


const {
    PLATFORM_FEE_PERCENT,
    AUTHENTICATION_FEE,
    AUTH_THRESHOLD,
    DEFAULT_PACKAGE_DIMENSIONS,
    NO_SHIPPING_SUBCATEGORIES,
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


async function initiateOrder(
    productId,
    buyerId,
    address,
    bidId = null,
    wantAuth = false,
    discountCode = null,
    shippingMethod = null
) {
    validateAddress(address);

    const product = await productRepo.getProductById(productId);
    if (!product || product.status !== 'Approved') {
        throw new Error("This product is not available for purchase.");
    }

    if (product.seller._id.toString() === buyerId.toString()) {
        const err = new Error("You cannot purchase your own product.");
        err.status = 400;
        throw err;
    }

    // Weight validation
    if (
        !product.weight ||
        typeof product.weight !== "number" ||
        product.weight < 100 ||
        product.weight > 20000
    ) {
        const err = new Error("Product weight is invalid. The seller must correct the product weight before this item can be purchased.");
        err.status = 400;
        throw err;
    }

    const seller = product.seller;

    if (!seller.profile?.address?.street ||
        !seller.profile?.address?.houseNumber ||
        !seller.profile?.address?.city ||
        !seller.profile?.address?.zip ||
        !seller.profile?.address?.country) {
        throw new Error("The seller has not completed their address. This product cannot be purchased at the moment.");
    }

    if (!seller.stripeAccountId) {
        const err = new Error("The seller cannot receive payments at the moment. Stripe account missing.");
        err.status = 403;
        err.requiresStripe = true;
        throw err;
    }

    // ⭐ Determine if this is a large item (manual pickup)
    const isLargeItem =
        product.isLargeItem === true ||
        NO_SHIPPING_SUBCATEGORIES?.includes(product.subcategory.toString());

    let finalPrice = product.price;

    // Bid logic
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

    // ⭐ Shipping price
    let shippingPrice = 0;

    if (!isLargeItem) {
        if (process.env.NODE_ENV === 'production') {
            const rate = await shippingService.getRate({
                fromAddress: seller.profile.address,
                toAddress: address,
                weight: product.weight,
                dimensions: product.dimensions || DEFAULT_PACKAGE_DIMENSIONS,
                shippingMethod,
            });
            shippingPrice = rate.price;
        } else {
            shippingPrice = 50;
        }
    }

    // ⭐ Discount code
    let discountAmount = 0;
    let appliedDiscountId = null;

    if (discountCode) {
        const result = await discountCodeService.validateAndCalculate({
            code: discountCode,
            userId: buyerId,
            product,
            basePrice: finalPrice,
        });

        if (result.valid) {
            discountAmount = result.discountAmount;
            appliedDiscountId = result.discount._id;
        }
    }

    // Authentication fee
    const isAuthForced = finalPrice >= AUTH_THRESHOLD;
    const requiresAuthentication = isAuthForced || wantAuth;
    const currentAuthFee = requiresAuthentication ? AUTHENTICATION_FEE : 0;

    // Platform fee + seller payout
    const platformFee = Math.round(finalPrice * (PLATFORM_FEE_PERCENT / 100));
    const sellerPayout = finalPrice - platformFee;

    // Total amount (shippingPrice = 0 for large items)
    const totalAmount = finalPrice - discountAmount + shippingPrice + currentAuthFee;

    // ⭐ Order data
    const orderData = {
        product: productId,
        buyer: buyerId,
        seller: seller._id,
        totalAmount,
        platformFee,
        sellerPayout,
        requiresAuthentication,
        authenticationFee: currentAuthFee,
        authenticationStatus: requiresAuthentication ? 'pending' : 'not_required',

        // ⭐ Large items start in "awaiting_pickup"
        status: isLargeItem ? 'awaiting_pickup' : 'pending',

        shippingAddress: address,
        shippingPrice,
        appliedDiscountCode: appliedDiscountId,
        discountAmount,
    };

    const order = await orderRepo.createOrder(orderData);

    await autoRejectBidsForPurchasedProduct(productId);

    // ⭐ PaymentIntent (unchanged)
    let paymentIntent;
    try {
        paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100,
            currency: 'dkk',
            capture_method: 'manual',
            application_fee_amount: platformFee * 100,
            transfer_data: {
                destination: seller.stripeAccountId
            },
            metadata: {
                orderId: order._id.toString(),
                productId: productId.toString(),
                buyerId: buyerId.toString(),
                sellerId: seller._id.toString()
            }
        });
    } catch (err) {
        if (
            err.code === "account_invalid" ||
            err.code === "destination_account_inactive" ||
            err.code === "account_closed"
        ) {
            const e = new Error(
                "The seller’s Stripe account is inactive. They must reconnect their Stripe account before this item can be purchased."
            );
            e.status = 400;
            e.requiresSellerStripeReconnect = true;
            throw e;
        }
        throw err;
    }

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
            // 1) Skip hvis auth ikke er færdig
            if (order.requiresAuthentication) {
                if (order.authenticationStatus !== 'passed') continue;
                if (order.status !== 'delivered') continue;
            }

            const seller = order.seller;
            if (!seller || !seller.stripeAccountId) {
                console.error(`❌ Order ${order._id} mangler seller.stripeAccountId`);
                continue;
            }

            // 2) Tjek Stripe account status
            const status = await checkStripeAccountStatus(seller.stripeAccountId);

            if (status.needsOnboarding) {
                console.log(`⏸ Seller ${seller._id} mangler onboarding → ingen payout`);
                continue;
            }

            // 3) Capture PaymentIntent (pengene går til din platform)
            console.log(`🤖 Capturing PaymentIntent for order ${order._id}`);
            const capture = await stripe.paymentIntents.capture(order.stripePaymentIntentId);

            // 4) Lav transfer til sælgerens Stripe‑konto
            const transferAmount = Math.round(order.sellerPayout * 100);// i øre

            console.log(`🤖 Transferring ${transferAmount} øre to seller ${seller.stripeAccountId}`);

            const transfer = await stripe.transfers.create({
                amount: transferAmount,
                currency: "dkk",
                destination: seller.stripeAccountId,
                metadata: {
                    orderId: order._id.toString(),
                }
            });

            // 5) Markér ordren som paid out
            await orderRepo.updateOrderAsPaidOut(order._id, {
                paymentIntentId: capture.id,
                transferId: transfer.id
            });

            console.log(`✅ Payout completed for order ${order._id}`);

        } catch (error) {
            console.error(`❌ Error processing payout for order ${order._id}:`, error.message);
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

    const productId = order.product._id || order.product;
    await productRepo.updateStatusProduct(productId, 'Sold');
    console.log(`✅ Produkt ${productId} er nu markeret som 'Sold'`);

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
    const shipment = payload?.shipment;
    if (!shipment) throw new Error("Invalid Shipmondo webhook payload");

    const shipmentId = shipment.id;
    const status = shipment.status?.trim().toLowerCase();

    if (!shipmentId || !status) {
        throw new Error("Missing shipment ID or status");
    }

    // Find ordre baseret på Shipmondo shipment ID
    const order = await orderRepo.findByExternalShippingId(shipmentId);
    if (!order) {
        throw new Error("Order not found for this Shipmondo shipment ID");
    }

    // Vi reagerer kun på leveret
    if (status !== "delivered") return;

    // Hvis ordren allerede er leveret, gør ingenting
    if (order.status === "delivered") return;

    // ⭐ NORMAL HANDEL (ingen authentication)
    if (!order.requiresAuthentication) {
        order.status = "delivered";
        order.deliveredAt = new Date();
        order.payoutEligibleAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
        await order.save();
        return;
    }

    // ⭐ AUTHENTICATION FLOW
    if (order.requiresAuthentication) {

        // 1) Sælger → Gilbert
        if (order.authenticationStatus === "pending") {
            order.status = "delivered";
            order.deliveredAt = new Date();
            await order.save();
            return;
        }

        // 2) Gilbert → Køber (hvis I bruger Shipmondo til videresendelse)
        if (order.authenticationStatus === "passed") {
            order.status = "delivered";
            order.deliveredAt = new Date();
            order.payoutEligibleAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
            await order.save();
            return;
        }
    }
}

async function autoRejectBidsForPurchasedProduct(productId) {
    // Find alle aktive/countered bud
    const bids = await bidRepo.findActiveBidsByProduct(productId, null);

    if (!bids.length) return;

    // Afvis dem i databasen
    await bidRepo.rejectAllActiveBids(productId, null);

    // Send notifikationer og chat
    for (const bid of bids) {
        try {
            await notificationService.notifyUser(bid.buyerId, {
                type: notificationTypes.bid_rejected,
                bidId: bid._id,
                productId: bid.productId,
            });

            await chatService.sendMessage(
                bid.productId,
                bid.buyerId,
                `SYSTEM_BID: Your bid was automatically rejected because the product was purchased.`
            );
        } catch (e) {
            console.error("Auto-reject on purchase error:", e);
        }
    }
}
async function confirmPickup(orderId, buyerId) {
    const order = await orderRepo.getOrderById(orderId);
    if (!order) {
        const err = new Error("Order not found.");
        err.status = 404;
        throw err;
    }

    if (order.buyer.toString() !== buyerId.toString()) {
        const err = new Error("You are not the buyer of this order.");
        err.status = 403;
        throw err;
    }

    if (order.status !== "awaiting_pickup") {
        const err = new Error("This order is not awaiting pickup.");
        err.status = 400;
        throw err;
    }

    const now = new Date();
    const payoutEligibleAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const updatedOrder = await orderRepo.updateOrderAfterPickup(orderId, {
        status: "delivered",
        deliveredAt: now,
        payoutEligibleAt
    });

    return updatedOrder;
}

async function approveDelivery(orderId, buyerId) {
    const order = await orderRepo.getOrderById(orderId);
    if (!order) {
        const err = new Error("Order not found.");
        err.status = 404;
        throw err;
    }

    // Buyer must own the order
    if (order.buyer.toString() !== buyerId.toString()) {
        const err = new Error("You are not the buyer of this order.");
        err.status = 403;
        throw err;
    }

    // Order must be in a state where approval makes sense
    if (order.status !== "delivered" && order.status !== "awaiting_pickup") {
        const err = new Error("This order cannot be approved at this stage.");
        err.status = 400;
        throw err;
    }

    // ⭐ Capture the PaymentIntent immediately
    let capture;
    try {
        capture = await stripe.paymentIntents.capture(order.stripePaymentIntentId);
    } catch (err) {
        const e = new Error("Payment could not be captured. Please try again later.");
        e.status = 500;
        throw e;
    }

    // ⭐ Update order as completed + paid out
    const updatedOrder = await orderRepo.approveDelivery(orderId, capture.id);

    return updatedOrder;
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
    confirmPickup,
    approveDelivery
};

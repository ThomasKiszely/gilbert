const orderRepo = require('../data/orderRepo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mailer = require('../utils/mailer');
const shippingService = require('../services/shippingService');

// ✅ APPROVE: auth passed + label til køber
async function handleAuthenticationPassed(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (!order.requiresAuthentication) {
        throw new Error("This order does not require authentication.");
    }

    await orderRepo.updateAuthenticationStatus(orderId, {
        authenticationStatus: "passed"
    });

    const label = await shippingService.createForwardLabel(orderId);

    return {
        message: "Authentication approved and label created.",
        labelUrl: label.base64,
        trackingNumber: label.tracking_number
    };
}

// ✅ FAIL: auth failed + refund + cancel + mails
async function handleAuthenticationFailed(orderId, notes = "") {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    await orderRepo.updateAuthenticationStatus(orderId, {
        authenticationStatus: "failed",
        authenticationNotes: notes
    });

    // Stripe: frigiv pengene (PaymentIntent er uncaptured)
    if (order.stripePaymentIntentId) {
        await stripe.paymentIntents.cancel(order.stripePaymentIntentId);
    }

    await orderRepo.updateOrderStatus(orderId, "cancelled");

    // Mail til køber
    try {
        await mailer.send({
            to: order.buyer.email,
            subject: "Authentication failed – you have been refunded",
            html: `
                <p>The item for order <strong>${orderId}</strong> failed authentication.</p>
                <p>Your reserved funds have been released / you will be refunded.</p>
                <p>Notes: ${notes}</p>
            `
        });
    } catch (err) {
        console.error("Failed to notify buyer about auth failure:", err.message);
    }

    // Mail til sælger
    try {
        await mailer.send({
            to: order.seller.email,
            subject: "Authentication failed – item will be returned",
            html: `
                <p>The item for order <strong>${orderId}</strong> failed authentication.</p>
                <p>The item will be returned to you.</p>
                <p>Notes: ${notes}</p>
            `
        });
    } catch (err) {
        console.error("Failed to notify seller about auth failure:", err.message);
    }

    return { success: true };
}

module.exports = {
    handleAuthenticationPassed,
    handleAuthenticationFailed
};

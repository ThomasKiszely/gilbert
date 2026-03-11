const orderRepo = require('../data/orderRepo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mailer = require('../utils/mailer');
const shippingService = require('../services/shippingService');

// ⭐ AUTHENTICATION PASSED → create forward label + notify buyer & seller
async function handleAuthenticationPassed(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (!order.requiresAuthentication) {
        throw new Error("This order does not require authentication.");
    }

    // 1. Update authentication status
    await orderRepo.updateAuthenticationStatus(orderId, {
        authenticationStatus: "passed"
    });

    // 2. Create forward label (Gilbert → Buyer)
    const mapped = await shippingService.createForwardLabel(orderId);

    // 3. Update order status
    await orderRepo.updateOrderStatus(orderId, "shipped_to_buyer");

    // 4. Notify buyer
    try {
        await mailer.send({
            to: order.buyer.email,
            subject: "Your item has passed authentication!",
            html: `
                <h2>Your item has passed authentication</h2>

                <p>The item from order <strong>${orderId}</strong> has been authenticated and is now on its way to you.</p>

                <p><strong>Tracking number:</strong> ${mapped.trackingNumber}</p>

                <p>
                    <a href="https://dao.as/track?pkg_no=${mapped.trackingNumber}">
                        Track your shipment
                    </a>
                </p>

                <p>
                    <a href="https://gilbert.dk/api/orders/${orderId}/label">
                        Download shipping label (PDF)
                    </a>
                </p>
            `
        });
    } catch (err) {
        console.error("Failed to notify buyer about auth pass:", err.message);
    }

    // 5. Notify seller
    try {
        await mailer.send({
            to: order.seller.email,
            subject: "Your item passed authentication",
            html: `
                <h2>Your item passed authentication</h2>

                <p>Your item <strong>${order.product.title}</strong> has passed authentication.</p>

                <p>It has now been shipped to the buyer.</p>

                <p><strong>Tracking number:</strong> ${mapped.trackingNumber}</p>
            `
        });
    } catch (err) {
        console.error("Failed to notify seller about auth pass:", err.message);
    }

    return {
        message: "Authentication approved and label created.",
        trackingNumber: mapped.trackingNumber,
        labelUrl: mapped.labelUrl
    };
}

// ⭐ AUTHENTICATION FAILED → refund buyer + return label + notify both parties
async function handleAuthenticationFailed(orderId, notes = "") {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    // 1. Update authentication status
    await orderRepo.updateAuthenticationStatus(orderId, {
        authenticationStatus: "failed",
        authenticationNotes: notes
    });

    // 2. Cancel PaymentIntent (uncaptured funds)
    if (order.stripePaymentIntentId) {
        await stripe.paymentIntents.cancel(order.stripePaymentIntentId);
    }

    // 3. Mark order as cancelled
    await orderRepo.updateOrderStatus(orderId, "cancelled");

    // ⭐ 4. Create return label (Gilbert → Seller)
    const returnLabel = await shippingService.createReturnLabel(orderId);

    await orderRepo.updateOrder(orderId, {
        returnTrackingNumber: returnLabel.trackingNumber,
        returnLabelUrl: returnLabel.labelUrl
    });

    // 5. Notify buyer
    try {
        await mailer.send({
            to: order.buyer.email,
            subject: "Authentication failed – you have been refunded",
            html: `
                <h2>Authentication failed</h2>

                <p>The item from order <strong>${orderId}</strong> did not pass authentication.</p>

                <p>Your reserved funds have been released / you will be refunded.</p>

                <p><strong>Notes:</strong> ${notes || "No additional information."}</p>
            `
        });
    } catch (err) {
        console.error("Failed to notify buyer about auth failure:", err.message);
    }

    // 6. Notify seller
    try {
        await mailer.send({
            to: order.seller.email,
            subject: "Authentication failed – item will be returned",
            html: `
                <h2>Authentication failed</h2>

                <p>Your item <strong>${order.product.title}</strong> did not pass authentication.</p>

                <p>The item will be returned to you.</p>

                <p><strong>Tracking number:</strong> ${returnLabel.trackingNumber}</p>

                <p>
                    <a href="https://gilbert.dk/api/orders/${orderId}/label">
                        Download return label (PDF)
                    </a>
                </p>

                <p><strong>Notes:</strong> ${notes || "No additional information."}</p>
            `
        });
    } catch (err) {
        console.error("Failed to notify seller about auth failure:", err.message);
    }

    return {
        success: true,
        returnTrackingNumber: returnLabel.trackingNumber,
        returnLabelUrl: returnLabel.labelUrl
    };
}

module.exports = {
    handleAuthenticationPassed,
    handleAuthenticationFailed,
};

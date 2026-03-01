// services/authenticationService.js
const orderRepo = require('../data/orderRepo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mailer = require('../utils/mailer');

async function verifyAuthentication(orderId, status, notes = "") {
    // 1. Find ordren
    const order = await orderRepo.findOrderById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    // 2. Map ekstern status → intern status
    let mappedStatus;
    if (status === 'verified') mappedStatus = 'passed';
    if (status === 'failed') mappedStatus = 'failed';

    if (!mappedStatus) {
        throw new Error("Invalid authentication status");
    }

    // 3. Opdater authentication-felter på ordren
    const updatedOrder = await orderRepo.updateAuthenticationStatus(orderId, {
        authenticationStatus: mappedStatus,
        authenticationNotes: notes
    });

    // ---------------------------------------------------------
    // 4. AUTHENTICATION FAILED → REFUND + CANCEL ORDER
    // ---------------------------------------------------------
    if (mappedStatus === "failed") {
        // PaymentIntent er stadig "uncaptured" → cancel = refund / release
        await stripe.paymentIntents.cancel(order.stripePaymentIntentId);

        // Ordren lukkes
        await orderRepo.updateOrderStatus(orderId, "cancelled");

        // Mail til køber
        try {
            await mailer.send({
                to: order.buyer.email,
                subject: "Authentication failed – you have been refunded",
                html: `
                    <p>The item for order <strong>${orderId}</strong> failed authentication.</p>
                    <p>You will be refunded / your reserved funds will be released.</p>
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

        return updatedOrder;
    }

    // ---------------------------------------------------------
    // 5. AUTHENTICATION PASSED → SEND VIDERE TIL KØBER
    // ---------------------------------------------------------
    if (mappedStatus === "passed") {

        // ⭐ VIGTIGT: Sæt status så systemet ved at auth er færdig
        await orderRepo.updateOrderStatus(orderId, "auth_passed");

        // Mail til shipping-teamet
        try {
            await mailer.send({
                to: process.env.AUTH_SHIPPING_EMAIL || process.env.ADMIN_EMAIL,
                subject: `Item authenticated – ship to buyer (Order ${orderId})`,
                html: `
                    <p>The item for order <strong>${orderId}</strong> has passed authentication.</p>
                    <p>Please ship it to the buyer:</p>
                    <p>
                        ${order.shippingAddress.name}<br/>
                        ${order.shippingAddress.street} ${order.shippingAddress.houseNumber}<br/>
                        ${order.shippingAddress.zip} ${order.shippingAddress.city}<br/>
                        ${order.shippingAddress.country}
                    </p>
                    <p>Notes: ${notes}</p>
                `
            });
        } catch (err) {
            console.error("Failed to notify shipping team about auth success:", err.message);
        }

        // Payout styres af:
        // - levering (Shipmondo webhook / approveDelivery)
        // - 72 timers cron
        return updatedOrder;
    }

    return updatedOrder;
}

module.exports = {
    verifyAuthentication
};

const orderService = require('../services/orderService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 1. Opret en ny ordre (Køb nu / Accepter bud)
async function initiateOrder(req, res, next) {
    try {
        // Vi trækker 'address' ud fra req.body (som vi sender fra Next.js)
        const { productId, bidId, wantAuth, address } = req.body;
        const buyerId = req.user._id;

        // VIGTIGT: Vi sender 'address' med som det 3. argument,
        // præcis som orderService.initiateOrder forventer det.
        const result = await orderService.initiateOrder(
            productId,
            buyerId,
            address, // <--- Her er den!
            bidId,
            wantAuth
        );

        // Bemærk: orderService returnerer { order, clientSecret }
        return res.status(201).json({
            success: true,
            order: result.order,
            clientSecret: result.clientSecret
        });
    } catch (error) {
        console.error("Controller Error:", error.message);
        next(error);
    }
}

// 2. Hent mine ordrer
async function getMyOrders(req, res, next) {
    try {
        const buyerId = req.user._id;
        const orders = await orderService.getUserOrders(buyerId);

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
}

// 3. Åben en sag/indsigelse (Dispute)
async function openOrderDispute(req, res, next) {
    try {
        const { id } = req.params; // Ordre ID fra URL'en
        const userId = req.user._id;

        const updatedOrder = await orderService.openOrderDispute(id, userId);

        return res.status(200).json({
            success: true,
            message: "Indsigelse er registreret. Udbetalingen er sat på pause.",
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
}

async function handleStripeWebhook(req, res, next) {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        // Vi bruger req.rawBody, som du gemmer i app.js via verify-funktionen
        if (!req.rawBody) {
            console.error("❌ rawBody mangler! Tjek app.js verify-konfigurationen.");
            return res.status(400).send("Webhook Error: Raw body missing");
        }

        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error(`❌ Webhook fejl: ${err.message}`);
        // Det er vigtigt at sende fejlen tilbage til Stripe, så de ved, signaturen var forkert
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ⭐ NYT: PaymentIntent succeeded
    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        try {
            await orderService.handlePaymentIntentSucceeded(intent);
            console.log(`✅ PaymentIntent succeeded for order ${intent.metadata.orderId}`);
        } catch (error) {
            console.error("❌ Fejl i handlePaymentIntentSucceeded:", error.message);
        }
    }


    res.json({ received: true });
}

async function getOrderById(req, res, next) {
    try {
        const order = await orderService.getOrderById(req.params.id, req.user._id);
        return res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
}
async function getMySales(req, res, next) {
    try {
        const userId = req.user._id;
        const sales = await orderService.getUserSales(userId);

        return res.status(200).json({
            success: true,
            count: sales.length,
            data: sales
        });
    } catch (error) {
        next(error);
    }
}

async function handleShipmondoWebhook(req, res, next) {
    try {
        await orderService.handleShipmondoWebhook(req.body);
        return res.status(200).json({ received: true });
    } catch (err) {
        console.error("Shipmondo webhook error:", err);
        return res.status(400).json({ error: err.message });
    }
}
async function approveDelivery(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const updatedOrder = await orderService.approveDelivery(id, userId);

        return res.status(200).json({
            success: true,
            message: "Delivery approved. Payment released to the seller.",
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    initiateOrder,
    getMyOrders,
    openOrderDispute,
    handleStripeWebhook,
    getOrderById,
    getMySales,
    handleShipmondoWebhook,
    approveDelivery
};
const orderService = require('../services/orderService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 1. Opret en ny ordre (Køb nu / Accepter bud)
async function initiateOrder(req, res, next) {
    try {
        // Vi trækker 'address' ud fra req.body (som vi sender fra Next.js)
        const { productId, bidId, wantAuth, address, discountCode, shippingMethod } = req.body;
        const buyerId = req.user._id;

        // VIGTIGT: Vi sender 'address' med som det 3. argument,
        // præcis som orderService.initiateOrder forventer det.
        const result = await orderService.initiateOrder(
            productId,
            buyerId,
            address,
            bidId,
            wantAuth,
            discountCode,
            shippingMethod
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
        const { id } = req.params; // Ordre ID
        const userId = req.user._id;
        const { reason } = req.body; // begrundelse fra køber

        const updatedOrder = await orderService.openOrderDispute(id, userId, reason);

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
        if (!req.rawBody) {
            return res.status(400).send("Webhook Error: Raw body missing");
        }

        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Webhook fejl: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 1. Log event type for at debugge (Du kan fjerne denne senere)
    console.log(`⚡ Event modtaget: ${event.type}`);

    // 2. Håndter både PaymentIntent og Charge events
    // Charge events indeholder ofte et 'payment_intent' ID, som vi kan bruge
    if (event.type === 'payment_intent.succeeded' || event.type === 'charge.succeeded') {
        const object = event.data.object;

        // Vi skal finde orderId.
        // Ved 'payment_intent.succeeded' ligger det i metadata direkte.
        // Ved 'charge.succeeded' ligger metadata ofte i det tilknyttede PaymentIntent.
        let orderId = object.metadata?.orderId;

        // Hvis vi er i en charge, og metadata mangler, prøver vi at hente PaymentIntent
        if (!orderId && object.payment_intent) {
            try {
                const paymentIntent = await stripe.paymentIntents.retrieve(object.payment_intent);
                orderId = paymentIntent.metadata?.orderId;
            } catch (err) {
                console.error("❌ Kunne ikke hente PaymentIntent for charge:", err.message);
            }
        }

        if (orderId) {
            try {
                // Vi sender objektet videre, men sørger for at orderService ved hvilket ID vi taler om
                await orderService.handlePaymentIntentSucceeded({ ...object, metadata: { orderId } });
                console.log(`✅ Ordre ${orderId} markeret som betalt via ${event.type}`);
            } catch (error) {
                console.error("❌ Fejl i orderService:", error.message);
                return res.status(500).send("Internal Server Error");
            }
        } else {
            console.warn("⚠️ Event modtaget uden orderId i metadata", event.type);
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

async function confirmPickup(req, res, next) {
    try {
        const orderId = req.params.orderId;
        const buyerId = req.user.id;

        const updatedOrder = await orderService.confirmPickup(orderId, buyerId);

        return res.json({
            success: true,
            message: "Pickup confirmed. Your 72-hour protection period has started.",
            order: updatedOrder
        });

    } catch (err) {
        next(err);
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
    approveDelivery,
    confirmPickup,
};
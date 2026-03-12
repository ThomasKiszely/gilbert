const orderService = require('../services/orderService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sanitizeUser } = require("../utils/sanitizeUser");

// 1. Opret en ny ordre (Køb nu / Accepter bud)
async function initiateOrder(req, res, next) {
    try {
        const { productId, bidId, wantAuth, address, discountCode, shippingMethod } = req.body;
        const buyerId = req.user._id;

        const result = await orderService.initiateOrder(
            productId,
            buyerId,
            address,
            bidId,
            wantAuth,
            discountCode,
            shippingMethod
        );

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

        const safeOrders = orders.map(o => {
            const obj = o;
            return {
                ...obj,
                buyer: sanitizeUser(obj.buyer),
                seller: sanitizeUser(obj.seller)
            };
        });

        return res.status(200).json({
            success: true,
            count: safeOrders.length,
            data: safeOrders
        });
    } catch (error) {
        next(error);
    }
}

// 3. Åben en sag/indsigelse (Dispute)
async function openOrderDispute(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { reason } = req.body;

        const updatedOrder = await orderService.openOrderDispute(id, userId, reason);

        const safeOrder = {
            ...updatedOrder.toObject(),
            buyer: sanitizeUser(updatedOrder.buyer),
            seller: sanitizeUser(updatedOrder.seller)
        };

        return res.status(200).json({
            success: true,
            message: "Indsigelse er registreret. Udbetalingen er sat på pause.",
            data: safeOrder
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

    console.log(`⚡ Event modtaget: ${event.type}`);

    if (event.type === 'payment_intent.succeeded' || event.type === 'charge.succeeded') {
        const object = event.data.object;
        let orderId = object.metadata?.orderId;

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

        const safeOrder = {
            ...order.toObject(),
            buyer: sanitizeUser(order.buyer),
            seller: sanitizeUser(order.seller)
        };

        return res.status(200).json({ success: true, data: safeOrder });
    } catch (err) {
        next(err);
    }
}

async function getMySales(req, res, next) {
    try {
        const userId = req.user._id;
        const sales = await orderService.getUserSales(userId);

        const safeSales = sales.map(o => ({
            ...o,
            buyer: sanitizeUser(o.buyer),
            seller: sanitizeUser(o.seller)
        }));

        return res.status(200).json({
            success: true,
            count: safeSales.length,
            data: safeSales
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

        const safeOrder = {
            ...updatedOrder.toObject(),
            buyer: sanitizeUser(updatedOrder.buyer),
            seller: sanitizeUser(updatedOrder.seller)
        };

        return res.status(200).json({
            success: true,
            message: "Delivery approved. Payment released to the seller.",
            data: safeOrder
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

        const safeOrder = {
            ...updatedOrder.toObject(),
            buyer: sanitizeUser(updatedOrder.buyer),
            seller: sanitizeUser(updatedOrder.seller)
        };

        return res.json({
            success: true,
            message: "Pickup confirmed. Your 72-hour protection period has started.",
            order: safeOrder
        });

    } catch (err) {
        next(err);
    }
}

async function downloadLabel(req, res, next) {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;
        const userRole = req.user.role;

        const order = await orderService.findOrderById(orderId);
        if (!order) return res.status(404).send("No order found.");

        const isSeller = order.seller._id.toString() === userId.toString();
        const isBuyer = order.buyer._id.toString() === userId.toString();
        const isAdmin = userRole === "admin";

        if (!isSeller && !isBuyer && !isAdmin) {
            return res.status(403).send("Not allowed");
        }

        const labelBase64 = order.labelUrl || order.returnLabelUrl;

        if (!labelBase64) {
            return res.status(404).send("Label not available");
        }

        const pdfBuffer = Buffer.from(labelBase64, "base64");

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=label.pdf");
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Label download error:", error.message);
        next(error);
    }
}

module.exports = {
    downloadLabel,
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

const Order = require('../models/Order');

async function createOrder(orderData) {
    const order = new Order(orderData);
    await order.save();
    return await order.populate('product buyer seller');
}

async function findOrderById(id) {
    return await Order.findById(id)
        .populate('product')
        .populate('buyer')
        .populate({
            path: 'seller',
            // Vi vælger eksplicit profil-feltet, så vi får adressen med
            select: 'username email profile stripeAccountId'
        });
}

async function updateOrderStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
}

async function updateOrderSession(orderId, sessionId) {
    return await Order.findByIdAndUpdate(
        orderId,
        { stripeSessionId: sessionId },
        { new: true }
    );
}

async function findOrderBySessionId(sessionId) {
    return await Order.findOne({ stripeSessionId: sessionId });
}


async function markAsDelivered(orderId) {
    const deliveredAt = new Date();
    // Vi lægger 72 timer til nuværende tidspunkt
    const payoutEligibleAt = new Date(deliveredAt.getTime() + (72 * 60 * 60 * 1000));

    return await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'delivered',
            deliveredAt: deliveredAt,
            payoutEligibleAt: payoutEligibleAt
        },
        { new: true, runValidators: true }
    );
}

async function getOrdersByBuyer(buyerId) {
    return await Order.find({ buyer: buyerId })
        .populate('product') // Så vi kan se hvad der er købt (titel, billede osv.)
        .populate('seller', 'username') // Så vi kan se hvem vi har købt af
        .sort({ createdAt: -1 }); // Nyeste øverst
}

// Finder ordrer, hvor 72-timers fristen er udløbet
async function findOrdersReadyForPayout(now) {
    return await Order.find({
        status: 'delivered',       // Varen skal være modtaget
        isPaidOut: false,          // Sælger må ikke have fået penge endnu
        payoutEligibleAt: { $lte: now } // Tiden skal være gået ud (less than or equal to nu)
    }).populate('seller');         // Vi skal bruge sælgerens Stripe-ID
}

// Opdaterer ordren, når vi har sendt pengene via Stripe
async function updateOrderAsPaidOut(orderId, transactionId) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            isPaidOut: true,
            status: 'completed', // Nu er handlen officielt slut
            payoutTransactionId: transactionId
        },
        { new: true, runValidators: true }
    );
}

async function disputeOrder(orderId) {
    return await Order.findByIdAndUpdate(
        orderId,
        { status: 'disputed' }, // Dette stopper 'processEligiblePayouts'
        { new: true, runValidators: true }
    );
}

async function updateOrderShipping(orderId, shippingData) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            shippingTrackingNumber: shippingData.trackingNumber,
            shippingLabelUrl: shippingData.labelUrl,
            // Vi kan også gemme Shipmondo's interne ID hvis PO siger god for det
            externalShippingId: shippingData.externalId
        },
        { new: true, runValidators: true }
    );
}

async function updateOrderStatusWithAddress(orderId, updateData) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            status: updateData.status,
            shippingAddress: updateData.shippingAddress,
            stripePaymentIntentId: updateData.stripePaymentIntentId
        },
        { new: true, runValidators: true }
    );
}

async function updateAuthenticationStatus(orderId, data) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            authenticationStatus: data.authenticationStatus,
            authenticationNotes: data.authenticationNotes || ""
        },
        { new: true, runValidators: true }
    );
}

async function markOrderAsDisputed(orderId, reason = "") {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'disputed',
            disputeReason: reason
        },
        { new: true, runValidators: true }
    );
}

async function findAllOrders(query = {}) {
    try {
        return await Order.find(query)
            .populate('buyer', 'username email')   // Hent kun de nødvendige felter
            .populate('seller', 'username email')
            .populate('product', 'title price images')
            .sort({ createdAt: -1 });              // Nyeste ordrer først
    } catch (error) {
        throw new Error("Repository error: " + error.message);
    }
}



module.exports = {
    createOrder,
    findOrderById,
    updateOrderStatus,
    updateOrderSession,
    findOrderBySessionId,
    markAsDelivered,
    getOrdersByBuyer,
    findOrdersReadyForPayout,
    updateOrderAsPaidOut,
    disputeOrder,
    updateOrderShipping,
    updateOrderStatusWithAddress,
    updateAuthenticationStatus,
    markOrderAsDisputed,
    findAllOrders,
};
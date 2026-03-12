const Order = require('../models/Order');

async function createOrder(orderData) {
    // Sørg for at shippingMethod mappes fra orderData
    const order = new Order({
        ...orderData,
        shippingMethod: orderData.shippingMethod
    });
    await order.save();
    return await order.populate('product buyer seller appliedDiscountCode');
}

async function findOrderById(id) {
    return await Order.findById(id)
        .populate('product')
        .populate('buyer')
        .populate('appliedDiscountCode')
        .populate({
            path: 'seller',
            select: '_id username email profile stripeAccountId'
        });
}


async function updateOrderPaymentIntentId(orderId, paymentIntentId) {
    return await Order.findByIdAndUpdate(
        orderId,
        { stripePaymentIntentId: paymentIntentId },
        { new: true, runValidators: true }
    );
}

async function markAsDelivered(orderId) {
    const deliveredAt = new Date();
    const payoutEligibleAt = new Date(
        deliveredAt.getTime() + (72 * 60 * 60 * 1000)
    );

    return await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'delivered',
            deliveredAt,
            payoutEligibleAt
        },
        { new: true, runValidators: true }
    );
}

async function getOrdersByBuyer(buyerId) {
    return await Order.find({ buyer: buyerId })
        .populate('product')
        .populate('seller', 'username')
        .populate('appliedDiscountCode')
        .sort({ createdAt: -1 });
}

async function findOrdersReadyForPayout(now) {
    return await Order.find({
        status: 'delivered',
        isPaidOut: false,
        payoutEligibleAt: { $lte: now }
    }).populate('seller');
}

async function updateOrderAsPaidOut(orderId, transactionId) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            isPaidOut: true,
            status: 'completed',
            payoutTransactionId: transactionId
        },
        { new: true, runValidators: true }
    );
}

async function disputeOrder(orderId) {
    return await Order.findByIdAndUpdate(
        orderId,
        { status: 'disputed' },
        { new: true, runValidators: true }
    );
}

async function updateOrderShipping(orderId, shippingData) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            $set: {
                trackingNumber: shippingData.trackingNumber,
                labelUrl: shippingData.labelUrl,
                externalShippingId: shippingData.externalShippingId,
                shipmondoOrderId: shippingData.shipmondoOrderId,
                shippingError: shippingData.shippingError || null
            }
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
            stripePaymentIntentId: updateData.stripePaymentIntentId,
            shippingMethod: updateData.shippingMethod // <--- TILFØJ DENNE
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

async function markOrderAsDisputed(orderId, reason) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'disputed',
            disputeReason: reason || ''
        },
        { new: true, runValidators: true }
    );
}

async function updateOrderStatus(orderId, status) {
    return await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
    );
}


async function findAllOrders(query = {}) {
    try {
        return await Order.find(query)
            .populate('buyer', 'username email')
            .populate('seller', 'username email')
            .populate('product', 'title price images')
            .populate('appliedDiscountCode')
            .sort({ createdAt: -1 });
    } catch (error) {
        throw new Error("Repository error: " + error.message);
    }
}
async function getOrdersBySeller(sellerId) {
    return await Order.find({ seller: sellerId })
        .populate('product')
        .populate('buyer', 'username email')
        .populate('appliedDiscountCode')
        .sort({ createdAt: -1 });
}


async function findByShipmondoOrderId(shipmondoOrderId) {
    return Order.findOne({ shipmondoOrderId })
        .populate("product")
        .populate("buyer")
        .populate("seller");
}

async function approveDelivery(orderId, transactionId) {
    return await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'completed',
            isPaidOut: true,
            payoutTransactionId: transactionId
        },
        { new: true, runValidators: true }
    );
}

async function setDeliveredAt(orderId, deliveredAt) {
    return await Order.findByIdAndUpdate(
        orderId,
        { deliveredAt },
        { new: true }
    );
}

async function setPayoutEligibleAt(orderId, payoutEligibleAt) {
    return await Order.findByIdAndUpdate(
        orderId,
        { payoutEligibleAt },
        { new: true }
    );
}

async function findByExternalShippingId(id) {
    return Order.findOne({ externalShippingId: id })
        .populate('buyer')
        .populate('seller')
        .populate('product');
}

async function updateOrderAfterPickup(orderId, updateData) {
    return Order.findByIdAndUpdate(orderId, updateData, { new: true });
}

async function countOrdersByBuyer(buyerId) {
    return await Order.countDocuments({
        buyer: buyerId,
        status: { $in: ['completed', 'delivered', 'paid', 'shipped'] }
    });
}

async function findActiveOrdersForUser(userId) {
    return Order.find({
        $or: [
            { buyer: userId },
            { seller: userId }
        ],
        status: {
            $in: [
                'pending',
                'paid',
                'shipped',
                'auth_passed',
                'awaiting_pickup',
                'delivered',
                'awaiting_return',
                'disputed'
            ]
        }
    });
}


module.exports = {
    createOrder,
    findOrderById,
    updateOrderStatus,
    updateOrderPaymentIntentId,
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
    getOrdersBySeller,
    findByShipmondoOrderId,
    approveDelivery,
    setDeliveredAt,
    setPayoutEligibleAt,
    findByExternalShippingId,
    updateOrderAfterPickup,
    countOrdersByBuyer,
    findActiveOrdersForUser
};

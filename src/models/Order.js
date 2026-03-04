const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    sellerPayout: { type: Number, required: true },

    requiresAuthentication: { type: Boolean, default: false },
    authenticationFee: { type: Number, default: 0 },

    authenticationStatus: {
        type: String,
        enum: ['not_required', 'pending', 'passed', 'failed'],
        default: 'not_required'
    },

    authenticationNotes: { type: String, default: "" },
    disputeReason: { type: String, default: "" },

    appliedDiscountCode: { type: mongoose.Schema.Types.ObjectId, ref: "DiscountCode" },
    discountAmount: { type: Number, default: 0 },

    stripePaymentIntentId: { type: String },

    status: {
        type: String,
        enum: [
            'pending',
            'paid',
            'shipped',
            'auth_passed',
            'delivered',
            'disputed',
            'awaiting_return',
            'completed',
            'cancelled'
        ],
        default: 'pending'
    },

    deliveredAt: { type: Date },
    payoutEligibleAt: { type: Date },

    isPaidOut: { type: Boolean, default: false },
    payoutTransactionId: { type: String },

    shippingAddress: {
        name: String,
        street: String,
        houseNumber: String,
        city: String,
        zip: String,
        country: { type: String, default: 'Denmark' }
    },

    trackingNumber: { type: String },
    labelUrl: { type: String },
    externalShippingId: { type: String },
    shippingError: { type: String },
    shipmondoOrderId: { type: String },

}, { timestamps: true });

orderSchema.methods.canPayout = function() {
    if (!this.deliveredAt) return false;
    const now = new Date();
    return now >= this.payoutEligibleAt && this.status !== 'disputed';
};

module.exports = mongoose.model('Order', orderSchema);

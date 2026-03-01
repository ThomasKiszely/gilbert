const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Økonomi (gemmes i øre/cents for at undgå afrundingsfejl)
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    sellerPayout: { type: Number, required: true },

    // Authentication (Gilbert tjek)
    requiresAuthentication: { type: Boolean, default: false },
    authenticationFee: { type: Number, default: 0 },
    authenticationStatus: {
        type: String,
        enum: ['not_required', 'pending', 'verified', 'failed'],
        default: 'not_required'
    },
    authenticationNotes: { type: String, default: "" },
    disputeReason: { type: String, default: "" },

    // Rabatkoder
    appliedDiscountCode: { type: String },
    discountAmount: { type: Number, default: 0 },

    // Stripe referencer
    stripePaymentIntentId: { type: String },

    status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'delivered', 'disputed', 'awaiting_return', 'completed', 'cancelled'],
        default: 'pending'
    },

    // 72-timers reglen (Reklamationsfrist)
    deliveredAt: { type: Date }, // Sættes når status ændres til 'delivered'
    payoutEligibleAt: { type: Date }, // Leveringstidspunkt + 72 timer

    // Udbetaling til sælger via Stripe Connect
    isPaidOut: { type: Boolean, default: false },
    payoutTransactionId: { type: String },

    // Forsendelse - Informationer fra Stripe Webhook
    shippingAddress: {
        name: String,
        street: String,
        city: String,
        zip: String,
        country: { type: String, default: 'Denmark' }
    },

    // Forsendelse - Informationer fra Shipmondo
    shippingTrackingNumber: { type: String },
    shippingLabelUrl: { type: String },
    externalShippingId: { type: String }, // Shipmondos interne ID
    shippingError: { type: String },       // Logning hvis automatiseringen fejler
    shipmondoOrderId: { type: String },

}, { timestamps: true });

// En hjælper-metode til at tjekke om udbetaling er mulig
orderSchema.methods.canPayout = function() {
    if (!this.deliveredAt) return false;
    const now = new Date();
    return now >= this.payoutEligibleAt && this.status !== 'disputed';
};

module.exports = mongoose.model('Order', orderSchema);
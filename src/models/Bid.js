const mongoose = require('mongoose');
const bidStatusses = require('../utils/bidStatusses');

const bidSchema = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
    buyerId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(bidStatusses), default: bidStatusses.active },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    counterAmount: { type: Number, default: null },
    history: [
        {
            action: { type: String, enum: Object.values(bidStatusses) },
            timestamp: { type: Date },
            actorId: { type: mongoose.Types.ObjectId, ref: 'User' },
            details: { type: String},
        }
    ]
});

module.exports = mongoose.model('Bid', bidSchema);
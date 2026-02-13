const mongoose = require("mongoose");

const chatThreadSchema = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
    buyerId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ChatThread', chatThreadSchema);
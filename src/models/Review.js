const mongoose = require('mongoose');
const buyerSellerRoles = require('../utils/buyerSellerRoles');

const reviewSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxLength: 500 },
    role: { type: String, enum: Object.values(buyerSellerRoles), required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
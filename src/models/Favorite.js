const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
    createdAt: { type: Date, default: Date.now },
});
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
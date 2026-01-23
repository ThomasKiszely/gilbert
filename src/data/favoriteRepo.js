const Favorite = require('../models/Favorite');

async function addFavorite(userId, productId) {
    return Favorite.findOneAndUpdate(
        {    user: userId, product: productId },
    { $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
    );
}

async function removeFavorite(userId, productId) {
    return Favorite.deleteOne({ user: userId, product: productId });
}

async function getFavorites(userId) {
    return Favorite.find({ user: userId }).populate('product');
}

async function isFavorite(userId, productId) {
    return Favorite.exists({ user: userId, product: productId });
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite,
}
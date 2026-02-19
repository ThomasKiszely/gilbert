const Favorite = require('../models/Favorite');

async function addFavorite(userId, productId) {
    return await Favorite.findOneAndUpdate(
        {    user: userId, product: productId },
    { $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
    );
}

async function removeFavorite(userId, productId) {
    return await Favorite.deleteOne({ user: userId, product: productId });
}

async function getFavorites(userId) {
    return await Favorite.find({ user: userId }).populate('product');
}

async function isFavorite(userId, productId) {
    return await Favorite.exists({ user: userId, product: productId });
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite,
}
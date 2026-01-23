const favoriteRepo = require('../data/favoriteRepo');
const productRepo = require('../data/productRepo');

async function addFavorite(userId, productId) {
    return await favoriteRepo.addFavorite(userId, productId);
}

async function removeFavorite(userId, productId) {
    return await favoriteRepo.removeFavorite(userId, productId);
}
async function getFavorites(userId) {
    return await favoriteRepo.getFavorites(userId);
}
async function toggleFavorite(userId, productId) {
    const exists = await favoriteRepo.isFavorite(userId, productId);
    const product = await productRepo.getProductById(productId);

    if (!product && exists) {
        await favoriteRepo.removeFavorite(userId, productId);
        throw new Error("Product does not exist");
    }
    if (exists) {
        await favoriteRepo.removeFavorite(userId, productId);
        return { added: false };
    } else {
        await favoriteRepo.addFavorite(userId, productId);
        return { added: true };
    }
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    toggleFavorite,
}
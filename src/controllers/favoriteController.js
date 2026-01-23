const favoriteService = require("../services/favoriteService");

async function addFavorite(req, res, next) {
    try{
        const userId = req.user.id;
        const productId = req.params.productId;

        await favoriteService.addFavorite(userId, productId);
        return res.status(201).json({ success: true, message: "Product added as favorite." });
    } catch (error){
        next(error);
    }
}

async function removeFavorite(req, res, next) {
    try{
        const userId = req.user.id;
        const productId = req.params.productId;

        await favoriteService.removeFavorite(userId, productId);
        return res.status(200).json({ success: true, message: "Product removed as favorite." });
    } catch (error){
        next(error);
    }
}

async function getFavorites(req, res, next) {
    try{
        const userId = req.user.id;
        const favorites = await favoriteService.getFavorites(userId);
        return res.status(200).json({ success: true, favorites: favorites });
    } catch (error){
        next(error);
    }
}

async function toggleFavorite(req, res, next) {
    try{
        const userId = req.user.id;
        const productId = req.params.productId;
        const result = await favoriteService.toggleFavorite(userId, productId);
        return res.status(200).json({
            success: true,
            message: result.added
            ? "Product has been added as favorite."
            : "Product has been removed as favorite.",
        });
    } catch (error){
        next(error);
    }
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    toggleFavorite,
}
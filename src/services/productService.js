const productRepo = require("../data/productRepo");
const favoriteRepo = require("../data/favoriteRepo");
const imageService = require("../services/imageService");
const userRepo = require("../data/userRepo");

async function attachFavoriteStatus(products, userId) {
    if (!userId) return products;

    const favorites = await favoriteRepo.getFavorites(userId);

    const favoriteIds = new Set(
        favorites.map(f => f.product._id.toString()) // ← FIX HER
    );

    return products.map(p => {
        const plain = p.toObject?.() ?? p;
        return {
            ...plain,
            isFavorite: favoriteIds.has(plain._id.toString())
        };
    });
}



async function createProduct(productData) {
    const user = await userRepo.findUserById(productData.seller);
    if (user && user.isSuspended) {
        const err = new Error("Account suspended. You cannot create new listings.");
        err.status = 403;
        throw err;
    }
    return await productRepo.createProduct(productData);
}

async function readAllProducts(page, limit, userId) {
    const products = await productRepo.allProducts(page, limit);
    return attachFavoriteStatus(products, userId);
}
async function findProducts(filters, page, limit, userId) {
    const products = await productRepo.findProducts(filters, page, limit);
    return attachFavoriteStatus(products, userId);
}

async function getProductById(productId, userId) {
    const product = await productRepo.getProductById(productId);
    if (!product) return null;

    if (!userId) return product;

    const isFav = await favoriteRepo.isFavorite(userId, productId);
    return {
        ...product.toObject(),
        isFavorite: !!isFav
    };
}


async function updateProduct(productId, productData) {
    // Find produktet først for at tjekke ejeren (eller brug req.user fra controlleren)
    const product = await productRepo.getProductById(productId);
    if (!product) throw new Error("Product not found");

    const user = await userRepo.findUserById(product.seller); // Brug produktets eksisterende sælger-ID
    if (user && user.isSuspended) {
        const err = new Error("Account suspended. You cannot edit listings.");
        err.status = 403;
        throw err;
    }
    return await productRepo.updateProduct(productId, productData);
}

async function deleteProduct(productId) {
    const product = await productRepo.getProductById(productId);
    if (!product) return null;

    if (product.images && product.images.length > 0) {
        product.images.forEach(imgUrl => {
            imageService.deleteImage(imgUrl);
        });
    }

    await productRepo.deleteProduct(productId);
    return product;
}


async function searchProducts(filters, page, limit, userId) {
    const products = await productRepo.searchProducts(filters, page, limit);
    return attachFavoriteStatus(products, userId);
}

async function findProductsBySeller(sellerId, includeAll){
    return await productRepo.findProductsBySeller(sellerId, includeAll);
}

module.exports = {
    createProduct,
    readAllProducts,
    findProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    findProductsBySeller,
}
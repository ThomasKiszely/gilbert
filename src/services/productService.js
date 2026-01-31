const productRepo = require("../data/productRepo");
const imageService = require("../services/imageService");
async function createProduct(productData) {
    return await productRepo.createProduct(productData);
}

async function readAllProducts(page, limit) {
    return await productRepo.allProducts(page, limit);
}
async function findProducts(filters, page, limit) {
    return await productRepo.findProducts(filters, page, limit);
}

async function getProductById(productId) {
    return await productRepo.getProductById(productId);
}

async function updateProduct(productId, productData) {
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


async function searchProducts(filters, page, limit) {
    return await productRepo.searchProducts(filters, page, limit);
}

async function findProductsBySeller(sellerId){
    return await productRepo.findProductsBySeller(sellerId);
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
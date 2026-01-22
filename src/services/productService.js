const productRepo = require("../data/productRepo");

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
    return await productRepo.deleteProduct(productId);
}

async function searchProducts(filters, page, limit) {
    return await productRepo.searchProducts(filters, page, limit);
}

module.exports = {
    createProduct,
    readAllProducts,
    findProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
}
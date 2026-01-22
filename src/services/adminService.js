const productRepo = require('../data/productRepo');

async function updateStatusProduct(productId, status) {
    return await productRepo.updateStatusProduct(productId, status);
}

async function adminGetAllProducts(page, limit) {
    return await productRepo.adminGetAllProducts(page, limit);
}

async function getProductsInReview() {
    return await productRepo.getProductsInReview();
}

module.exports = {
    updateStatusProduct,
    adminGetAllProducts,
    getProductsInReview,
}
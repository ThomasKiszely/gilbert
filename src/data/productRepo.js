const Product = require("../models/Product");

const POPULATE_FIELDS = 'category subcategory brand size condition color material tags seller';
async function createProduct(productData) {
    const newProduct = new Product(productData);
    return await newProduct.save();
}

// Til forsiden
async function allProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Product.find({}).skip(skip).limit(limit)
        .populate(POPULATE_FIELDS).lean();
}

async function getProductById(productId) {
    return await Product.findById(productId)
        .populate(POPULATE_FIELDS).lean();
}
// Til specfik side fx. Mænd -> Clothing -> T-Shirt
async function findProducts(filters, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    return await Product.find(filters)
        .skip(skip).limit(limit)
        .populate(POPULATE_FIELDS).lean();
}

async function updateProduct(productId, productData) {
    const updatedProduct = await Product.findByIdAndUpdate( productId, productData, { new: true, runValidators: true } )
        .populate(POPULATE_FIELDS);
    return updatedProduct;
}
async function deleteProduct(productId) {
    const deltedProduct = await Product.findByIdAndDelete(productId);
    return deltedProduct;
}

module.exports = {
    createProduct,
    allProducts,
    getProductById,
    findProducts,
    updateProduct,
    deleteProduct
}
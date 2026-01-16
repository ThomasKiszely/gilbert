const productService = require('../services/productService');

async function createProduct(req, res, next) {
    try {
        const product = await productService.createProduct(req.body);
        if (!product) {
            const err = new Error('Product not created');
            err.status = 400;
            return next(err);
        }
        return res.status(201).json(product);
    } catch (error) {
        next(error);
    }
}

async function readAllProducts(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const products = await productService.readAllProducts(page, limit);

        if (!products) {
            const err = new Error('Products not found');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}
async function findProducts(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const filters = {
            ...req.query
        };
        const products = await productService.findProducts(filters,page, limit);
        if (!products) {
            const err = new Error('Products not found with filters');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}
async function getProductById(req, res, next) {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            const err = new Error('Product not found with valid id');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(product);
    } catch (error) {
        next(error);
    }
}
async function updateProduct(req, res, next) {
    try {
        const id = req.params.id;
        const product = req.body;
        const updatedProduct = await productService.updateProduct(id, product);
        if (!updatedProduct) {
            const err = new Error('Product could not be updated');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
}
async function deleteProduct(req, res, next) {
    try {
        const id = req.params.id;
        const deletedProduct = await productService.deleteProduct(id);
        if (!deletedProduct) {
            const err = new Error('Product could not be deleted');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(deletedProduct);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProduct,
    readAllProducts,
    findProducts,
    getProductById,
    updateProduct,
    deleteProduct,
}
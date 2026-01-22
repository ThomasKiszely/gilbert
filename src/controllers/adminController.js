const adminService = require('../services/adminService');

async function getAllProducts(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const products = await adminService.adminGetAllProducts(page, limit);

        if(!products) {
            const err = new Error('Not Found all products');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

async function getProductsInReview(req, res, next) {
    try {
        const products = await adminService.getProductsInReview();

        if(!products) {
            const err = new Error('Not Found products in review');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}


async function approveProduct(req, res, next) {
    try {
        const updated = await adminService.updateStatusProduct(req.params.id, "Approved");
        if(!updated) {
            const err = new Error('Could not approve product with id "' + req.params.id + '"');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

async function rejectProduct(req, res, next) {
    try {
        const updated = await adminService.updateStatusProduct(req.params.id, "Rejected");
        if(!updated) {
            const err = new Error('Could not reject product with id "' + req.params.id + '"');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    approveProduct,
    rejectProduct,
    getProductsInReview,
    getAllProducts,
}
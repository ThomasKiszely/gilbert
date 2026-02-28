const brandService = require('../services/brandService');

async function createBrand(req, res, next) {
    try {
        const brand = await brandService.createBrand(req.body);
        if(!brand) {
            const err = new Error('Failed to create brand');
            err.status = 400;
            next(err);
        }
        return res.status(201).json(brand);
    } catch (err) {
        next(err);
    }
}
async function readAllBrands(req, res, next) {
    try {
        const brands = await brandService.readAllBrands();
        if(!brands) {
            const err = new Error('Failed to read all brands');
            err.status = 400;
            next(err);
        }
        return res.status(200).json(brands);
    } catch (err) {
        next(err);
    }
}
async function getBrandById(req, res, next) {
    try {
        const brand = await brandService.getBrandById(req.params.id);
        if (!brand) {
            const err = new Error('Brand not found');
            err.status = 404;
            return next(err);
        }
        return res.status(200).json(brand);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createBrand,
    readAllBrands,
    getBrandById,
}
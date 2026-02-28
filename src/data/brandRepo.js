const Brand = require('../models/Brand');


async function createBrand(brandData) {
    const newBrand = new Brand(brandData);
    return await newBrand.save();
}

async function readAllBrands() {
    return await Brand.find({});
}

async function getBrandById(id) {
    return await Brand.findById(id);
}

module.exports = {
    createBrand,
    readAllBrands,
    getBrandById,
}
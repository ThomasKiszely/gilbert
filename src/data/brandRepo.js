const Brand = require('../models/Brand');


async function createBrand(brandData) {
    const newBrand = new Brand(brandData);
    return await newBrand.save();
}

async function readAllBrands() {
    return await Brand.find({});
}

module.exports = {
    createBrand,
    readAllBrands,
}
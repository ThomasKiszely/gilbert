const Brand = require('../models/Brand');


async function createBrand(brandData) {
    const newBrand = new Brand(brandData);
    return await newBrand.save();
}

module.exports = {
    createBrand,
}
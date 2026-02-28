const brandRepo = require('../data/brandRepo');


async function createBrand(brandData) {
    return await brandRepo.createBrand(brandData);
}

async function readAllBrands() {
    return await brandRepo.readAllBrands();
}

async function getBrandById(id) {
    return await brandRepo.getBrandById(id);
}

module.exports = {
    createBrand,
    readAllBrands,
    getBrandById,
}
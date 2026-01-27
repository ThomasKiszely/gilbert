const brandRepo = require('../data/brandRepo');


async function createBrand(brandData) {
    return await brandRepo.createBrand(brandData);
}

async function readAllBrands() {
    return await brandRepo.readAllBrands();
}

module.exports = {
    createBrand,
    readAllBrands,
}
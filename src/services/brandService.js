const brandRepo = require('../data/brandRepo');


async function createBrand(brandData) {
    return await brandRepo.createBrand(brandData);
}

module.exports = {
    createBrand,
}
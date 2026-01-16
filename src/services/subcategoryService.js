const subcategoryRepo = require('../data/subcategoryRepo');


async function createSubcategory(subcategoryData) {
    return await subcategoryRepo.createSubcategory(subcategoryData);
}
module.exports = {
    createSubcategory,
}
const subcategoryRepo = require('../data/subcategoryRepo');


async function createSubcategory(subcategoryData) {
    return await subcategoryRepo.createSubcategory(subcategoryData);
}

async function readAllSubcategories() {
    return await subcategoryRepo.readAllSubcategories();
}
module.exports = {
    createSubcategory,
    readAllSubcategories,
}
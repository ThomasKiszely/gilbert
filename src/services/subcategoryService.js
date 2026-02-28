const subcategoryRepo = require('../data/subcategoryRepo');


async function createSubcategory(subcategoryData) {
    return await subcategoryRepo.createSubcategory(subcategoryData);
}

async function readAllSubcategories() {
    return await subcategoryRepo.readAllSubcategories();
}

async function getSubcategoryName(id) {
    const sub = await subcategoryRepo.getSubcategoryById(id);
    if (!sub) return null;
    return {
        id: sub._id.toString(),
        name: sub.name
    };
}
module.exports = {
    createSubcategory,
    readAllSubcategories,
    getSubcategoryName,
}
const categoryRepo = require('../data/categoryRepo');


async function createCategory(categoryData) {
    return await categoryRepo.createCategory(categoryData);
}

async function readAllCategories() {
    return await categoryRepo.readAllCategories();
}

module.exports = {
    createCategory,
    readAllCategories,
}
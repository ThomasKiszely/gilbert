const categoryRepo = require('../data/categoryRepo');


async function createCategory(categoryData) {
    return await categoryRepo.createCategory(categoryData);
}

module.exports = {
    createCategory,
}
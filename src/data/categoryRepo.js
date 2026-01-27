const Category = require('../models/Category');


async function createCategory(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
}

async function readAllCategories() {
    return await Category.find({});
}

module.exports = {
    createCategory,
    readAllCategories,
}
const Category = require('../models/Category');


async function createCategory(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
}

module.exports = {
    createCategory,
}
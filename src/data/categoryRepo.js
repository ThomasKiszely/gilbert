const Category = require('../models/Category');
const Product = require("../models/Product");
const Subcategory = require("../models/Subcategory");

async function createCategory(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
}

async function readAllCategories() {
    return await Category.find({});
}

async function getAllCategoriesWithSubcategories() {
    const categories = await Category.find({});
    const subcategories = await Subcategory.find({}).select("_id name category");
    return { categories, subcategories };
}

module.exports = {
    createCategory,
    readAllCategories,
    getAllCategoriesWithSubcategories,
}
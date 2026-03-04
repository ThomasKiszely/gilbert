const Category = require('../models/Category');
const Subcategory = require("../models/Subcategory");
const Gender = require("../models/Gender");

async function createCategory(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
}

async function readAllCategories() {
    return await Category.find({});
}

async function getAllCategoriesWithSubcategories(gender) {
    const categories = await Category.find({});

    let subFilter = {};
    if (gender) {
        // gender Male osv. til ObjectId
        // Inkluderer gender 'Unisex i filteret
        const [genderDoc, unisexDoc] = await Promise.all([
            Gender.findOne({ name: gender }),
            Gender.findOne({ name: "Unisex" }),
        ]);
        const ids = [];
        if (genderDoc) ids.push(genderDoc._id);
        if (unisexDoc && gender !== "Unisex") ids.push(unisexDoc._id);
        if (ids.length > 0) {
            subFilter = { $or: [
                { gender: { $in: ids } },
                { gender: { $size: 0 } },
                { gender: { $exists: false } },
            ]};
        }
    }
    const subcategories = await Subcategory.find(subFilter).select("_id name category gender");

    return { categories, subcategories };
}

module.exports = {
    createCategory,
    readAllCategories,
    getAllCategoriesWithSubcategories,
}
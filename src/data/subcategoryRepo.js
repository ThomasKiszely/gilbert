const Subcategory = require('../models/subcategory');

async function createSubcategory(subcategoryData) {
    const subcategory = new Subcategory(subcategoryData);
    return await subcategory.save();
}

module.exports = {
    createSubcategory,
}
const Subcategory = require('../models/subcategory');

async function createSubcategory(subcategoryData) {
    const subcategory = new Subcategory(subcategoryData);
    return await subcategory.save();
}

async function readAllSubcategories() {
    return await Subcategory.find({});
}
module.exports = {
    createSubcategory,
    readAllSubcategories,
}
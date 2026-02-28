const Subcategory = require('../models/subcategory');

async function createSubcategory(subcategoryData) {
    const subcategory = new Subcategory(subcategoryData);
    return await subcategory.save();
}

async function readAllSubcategories() {
    return await Subcategory.find({});
}
async function getSubcategoryById(id) {
    return await Subcategory.findById(id).select("_id name category");
}
module.exports = {
    createSubcategory,
    readAllSubcategories,
    getSubcategoryById,
}
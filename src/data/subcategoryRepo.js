const Subcategory = require('../models/subcategory');
const Gender = require('../models/Gender');

async function createSubcategory(subcategoryData) {
    const subcategory = new Subcategory(subcategoryData);
    return await subcategory.save();
}

async function readAllSubcategories(filters = {}) {
    const query = {};

    // Filter by category ObjectId
    if (filters.category) {
        query.category = filters.category;
    }

    // Only apply gender filter if gender is set
    if (filters.gender) {
        const [genderDoc, unisexDoc] = await Promise.all([
            Gender.findOne({ name: filters.gender }),
            Gender.findOne({ name: "Unisex" }),
        ]);
        const ids = [];
        if (genderDoc) ids.push(genderDoc._id);
        if (unisexDoc && filters.gender !== "Unisex") ids.push(unisexDoc._id);
        if (ids.length > 0) {
            query.$or = [
                { gender: { $in: ids } },
                { gender: { $size: 0 } },
            ];
        }
    }

    return await Subcategory.find(query);
}

async function getSubcategoryById(id) {
    return await Subcategory.findById(id).select("_id name category");
}

module.exports = {
    createSubcategory,
    readAllSubcategories,
    getSubcategoryById,
}
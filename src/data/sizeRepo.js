const Size = require('../models/size');

async function createSize(sizeData) {
    const size = new Size(sizeData);
    return await size.save();
}

async function readAllSizes(filters = {}) {
    const query = {};

    // Filter by category ObjectId — sizes have a categories array
    if (filters.category) {
        query.categories = filters.category;
    }

    // Filter by size type (Clothing, Shoes, Kids, Other)
    if (filters.type) {
        query.type = filters.type;
    }

    return await Size.find(query);
}

module.exports = {
    createSize,
    readAllSizes,
}
const Size = require('../models/size');

async function createSize(sizeData) {
    const size = new Size(sizeData);
    return await size.save();
}

module.exports = {
    createSize,
}
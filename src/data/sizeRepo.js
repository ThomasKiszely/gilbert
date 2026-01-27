const Size = require('../models/size');

async function createSize(sizeData) {
    const size = new Size(sizeData);
    return await size.save();
}

async function readAllSizes() {
    return await Size.find({});
}

module.exports = {
    createSize,
    readAllSizes,
}
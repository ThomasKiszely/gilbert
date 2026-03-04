const sizeRepo = require('../data/sizeRepo');

async function createSize(sizeData) {
    return await sizeRepo.createSize(sizeData);
}

async function readAllSizes(filters) {
    return await sizeRepo.readAllSizes(filters);
}

module.exports = {
    createSize,
    readAllSizes,
}
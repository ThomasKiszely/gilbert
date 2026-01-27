const sizeRepo = require('../data/sizeRepo');

async function createSize(sizeData) {
    return await sizeRepo.createSize(sizeData);
}

async function readAllSizes() {
    return await sizeRepo.readAllSizes();
}

module.exports = {
    createSize,
    readAllSizes,
}
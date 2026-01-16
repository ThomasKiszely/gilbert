const sizeRepo = require('../data/sizeRepo');

async function createSize(sizeData) {
    return await sizeRepo.createSize(sizeData);
}

module.exports = {
    createSize,
}
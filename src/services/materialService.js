const materialRepo = require('../data/materialRepo');

async function createMaterial(materialData) {
    return await materialRepo.createMaterial(materialData);
}

module.exports = {
    createMaterial,
}
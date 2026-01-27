const materialRepo = require('../data/materialRepo');

async function createMaterial(materialData) {
    return await materialRepo.createMaterial(materialData);
}

async function readAllMaterials() {
    return await materialRepo.readAllMaterials();
}

module.exports = {
    createMaterial,
    readAllMaterials,
}
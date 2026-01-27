const Material = require('../models/Material');

async function createMaterial(materialData) {
    const material = new Material(materialData);
    return await material.save();
}

async function readAllMaterials() {
    return await Material.find({});
}

module.exports = {
    createMaterial,
    readAllMaterials,
}
const Material = require('../models/Material');

async function createMaterial(materialData) {
    const material = new Material(materialData);
    return await material.save();
}

module.exports = {
    createMaterial,
}
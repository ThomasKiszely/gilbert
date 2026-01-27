const materialService = require('../services/materialService');

async function createMaterial(req, res, next) {
    try {
        const material = await materialService.createMaterial(req.body);
        if (!material) {
            const error = new Error('Failed to create material');
            error.status = 400;
            next(error);
        }
        return res.status(201).json(material);
    } catch (error) {
        next(error);
    }
}

async function readAllMaterials(req, res, next) {
    try {
        const materials = await materialService.readAllMaterials();
        if (!materials) {
            const error = new Error('Failed to read all materials');
            error.status = 400;
            next(error);
        }
        return res.status(200).json(materials);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    createMaterial,
    readAllMaterials,
}
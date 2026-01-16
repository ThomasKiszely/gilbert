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

module.exports = {
    createMaterial,
}
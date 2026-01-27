const subcategoryService = require('../services/subcategoryService');


async function createSubcategory(req, res, next) {
    try {
        const subcategory = await subcategoryService.createSubcategory(req.body);

        if (!subcategory) {
            const error = new Error('Failed to create subcategory');
            error.status = 400;
            next(error);
        }
        return res.status(201).json(subcategory);
    } catch (error) {
        next(error);
    }
}

async function readAllSubcategories(req, res, next) {
    try {
        const subcategories = await subcategoryService.readAllSubcategories();
        if (!subcategories) {
            const error = new Error('Failed to read all subcategories');
            error.status = 400;
            next(error);
        }
        return res.status(200).json(subcategories);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    createSubcategory,
    readAllSubcategories,
}
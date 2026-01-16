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
module.exports = {
    createSubcategory,
}
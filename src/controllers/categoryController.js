const categoryService = require('../services/categoryService')


async function createCategory(req, res, next) {
    try {
        const category = await categoryService.createCategory(req.body);
        if (!category) {
            const error = new Error('Category not created');
            error.status = 400;
            next(error);
        }
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    createCategory,
}
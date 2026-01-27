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

async function  readAllCategories(req, res, next) {
    try {
        const categories = await categoryService.readAllCategories();
        if (!categories) {
            const error = new Error('Could not read all categories');
            error.status = 400;
            next(error);
        }
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    createCategory,
    readAllCategories,
}
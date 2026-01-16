const tagService = require('../services/tagService');

async function createTag(req, res, next) {
    try {
        const tag = await tagService.createTag(req.body);

        if (!tag) {
            const error = new Error('Failed to create tag');
            error.status = 400;
            next(error);
        }
        return res.status(201).json(tag);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTag,
}
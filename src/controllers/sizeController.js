const sizeService = require('../services/sizeService');


async function createSize(req, res, next) {
    try {
        const size = await sizeService.createSize(req.body);
        if(!size) {
            const error = new Error('Failed to create size.');
            error.status = 400;
            next(error);
        }
        return res.status(201).json(size);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createSize,
}
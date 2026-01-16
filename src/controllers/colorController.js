const colorService = require('../services/colorService');


async function createColor(req, res, next) {
    try {
        const color = await colorService.createColor(req.body);

        if(!color) {
            const error = new Error('Failed to create color');
            error.status = 400;
            next(error);
        }
        return res.status(201).json(color);
    } catch (error) {
        next(error);
    }
}

module.exports =  {
    createColor,
}
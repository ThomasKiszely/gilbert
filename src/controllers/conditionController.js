const conditionService = require('../services/conditionService');

async function createCondition(req, res, next) {
    try {
        const condition = await conditionService.createCondition(req.body);
        if (!condition) {
            const error = new Error('Failed to create condition');
            error.status = 400;
            next(error);
        }
        return res.status(201).json(condition);
    } catch (err) {
        next(err);
    }
}
module.exports = {
    createCondition,
}
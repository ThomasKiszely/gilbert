const sanitizeNumber = require('../utils/sanitizeNumber');

function validateBid(req, res, next) {
    const sanitized = sanitizeNumber(req.body.amount);

    if (sanitized === null) {
        return res.status(400).json({
            success: false,
            error: 'Bid amount must be a valid number',
        });
    }

    req.body.amount = sanitized;
    next();
}

function validateCounterBid(req, res, next) {
    const sanitized = sanitizeNumber(req.body.counterAmount);

    if (sanitized === null) {
        return res.status(400).json({
            success: false,
            error: 'Counter amount must be a valid number',
        });
    }

    req.body.counterAmount = sanitized;
    next();
}

module.exports = {
    validateBid,
    validateCounterBid,
};

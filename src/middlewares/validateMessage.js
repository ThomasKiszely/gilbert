const {sanitizeChatMessage} = require('../utils/sanitize');


function validateMessage(req, res, next) {
    const cleaned = sanitizeChatMessage(req.body.text);

    if(!cleaned ||cleaned.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Message cannot be empty'
        });
    }
    req.body.text = cleaned;
    next();
}

module.exports = { validateMessage };
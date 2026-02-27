const stripeService = require('../services/stripeService');

async function connectStripe(req, res, next) {
    try {
        const url = await stripeService.createConnectAccount(req.user._id);
        res.json({ url });
    } catch (error) {
        next(error);
    }
}

module.exports = { connectStripe };
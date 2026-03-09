const stripeService = require('../services/stripeService');

async function connectStripe(req, res, next) {
    try {
        const url = await stripeService.createConnectAccount(req.user._id);
        res.json({ url });
    } catch (error) {
        next(error);
    }
}

async function getStripeStatus(req, res, next) {
    try {
        const status = await stripeService.getStripeStatus(req.user._id);
        res.json(status);
    } catch (error) {
        next(error);
    }
}

module.exports = { connectStripe, getStripeStatus };

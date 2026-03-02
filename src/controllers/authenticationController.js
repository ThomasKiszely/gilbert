const authenticationService = require('../services/authenticationService');

async function approveAuthentication(req, res, next) {
    try {
        const { orderId } = req.params;
        const result = await authenticationService.handleAuthenticationPassed(orderId);

        return res.status(200).json({
            success: true,
            message: result.message,
            labelUrl: result.labelUrl,
            trackingNumber: result.trackingNumber
        });
    } catch (error) {
        next(error);
    }
}

async function failAuthentication(req, res, next) {
    try {
        const { orderId } = req.params;
        const { notes } = req.body;

        if (!notes) {
            return res.status(400).json({
                success: false,
                error: "Notes are required when failing authentication."
            });
        }

        await authenticationService.handleAuthenticationFailed(orderId, notes);

        return res.status(200).json({
            success: true,
            message: "Authentication failed. Buyer refunded and seller notified."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    approveAuthentication,
    failAuthentication
};

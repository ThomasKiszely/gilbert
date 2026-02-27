const authenticationService = require('../services/authenticationService');

async function verifyAuthentication(req, res, next) {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;

        // status forventes at være "verified" eller "failed"
        if (!['verified', 'failed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'verified' or 'failed'."
            });
        }

        const updatedOrder = await authenticationService.verifyAuthentication(orderId, status, notes);

        return res.status(200).json({
            success: true,
            message: `Authentication marked as ${status}.`,
            data: updatedOrder
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    verifyAuthentication
};

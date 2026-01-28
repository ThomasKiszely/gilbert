const { professionalStatus } = require("../utils/professionalStatus");

function validateProfessionalStatus(req, res, next) {
    const { professionalStatus: status } = req.body;
    if (!Object.values(professionalStatus).includes(status)) {
        return res.status(400).json({
            success: false,
            error: "Invalid professional status",
        });
    }
    next();
}

module.exports = {
    validateProfessionalStatus,
}

const { sanitizeString } = require("../utils/sanitize");

function validateAdminUserUpdate(req, res, next) {
    const errors = [];

    // ⭐ Admin må kun ændre bestemte felter
    const allowedAdminFields = [
        "isSuspended",
        "professionalStatus",
        "roles",
        "badges",
        "isEmailVerified"
    ];

    for (const key of Object.keys(req.body)) {
        if (!allowedAdminFields.includes(key)) {
            errors.push(`Admin is not allowed to update field: ${key}`);
        }
    }

    // ⭐ Saniter simple string fields
    if (req.body.professionalStatus) {
        req.body.professionalStatus = sanitizeString(req.body.professionalStatus.trim());
    }

    if (req.body.roles && !Array.isArray(req.body.roles)) {
        errors.push("Roles must be an array.");
    }

    if (req.body.badges && !Array.isArray(req.body.badges)) {
        errors.push("Badges must be an array.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
}

module.exports = { validateAdminUserUpdate };

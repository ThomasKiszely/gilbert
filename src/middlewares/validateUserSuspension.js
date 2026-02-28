function validateUserSuspension(req, res, next) {
    const { isSuspended, reason } = req.body;
    const errors = [];

    if (typeof isSuspended !== "boolean") {
        errors.push("isSuspended must be a boolean.");
    }

    if (isSuspended && (!reason || reason.trim().length < 3)) {
        errors.push("Suspension reason must be at least 3 characters.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
}
module.exports = {
    validateUserSuspension,
}
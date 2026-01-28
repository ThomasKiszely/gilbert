function validateUserBadges(req, res, next) {
    const { badges } = req.body;

    if (typeof badges !== "object") {
        return res.status(400).json({
            success: false,
            error: "Badges must be an object"
        });
    }

    const allowed = ["isProfessional", "isExpertSeller", "isIdVerified"];

    for (const key of Object.keys(badges)) {
        if (!allowed.includes(key)) {
            return res.status(400).json({
                success: false,
                error: `Invalid badge: ${key}`
            });
        }
        if (typeof badges[key] !== "boolean") {
            return res.status(400).json({
                success: false,
                error: `Badge ${key} must be boolean`
            });
        }
    }

    next();
}

module.exports = {
    validateUserBadges
};

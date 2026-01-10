function validateLogin(req, res, next) {
    const { email, password } = req.body;

    const errors = [];

    if (!email || typeof email !== "string" || email.trim().length === 0) {
        errors.push("Email is required");
    }

    if (!password || typeof password !== "string" || password.trim().length === 0) {
        errors.push("Password is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
}

module.exports = { validateLogin };

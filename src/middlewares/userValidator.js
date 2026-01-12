function sanitizeString(str) {
    return str
        .trim()
        .replace(/<[^>]*>?/gm, "") //Fjerner HTML‑tags og script‑tags
        .replace(/\s+/g, " ") //.replace(/\s+/g, " ")
        .replace(/[^\w\s\-ÆØÅæøå]/g, ""); //Fjerner alle tegn der ikke er tilladt
}

function validateUser(req, res, next) {
    const errors = [];

    let { username, email, password, location, termsAccepted } = req.body;

    if (typeof username === "string"){
        req.body.username = sanitizeString(username);
    }

    if (location && typeof location === "object"){
        if (typeof location.city === "string"){
            req.body.location.city = sanitizeString(location.city);
        }
        if (typeof location.country === "string"){
            req.body.location.country = sanitizeString(location.country);
        }
    }

    ({ username, email, password, location, termsAccepted } = req.body);

    if (typeof username !== 'string' || username.length < 2) {
        errors.push('Username must be at least 2 characters');
    }
    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push("Email is not valid");
        }
    }
    if (!password || typeof password !== 'string' || password.trim().length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!location || typeof location !== 'object') {
        errors.push('Location is required');
    } else {
        if (!location.city || location.city.length < 2) {
            errors.push('City is required');
        }
        if (!location.country || location.country.length < 2) {
            errors.push('Country is required');
        }
    }
    if (termsAccepted !== true && termsAccepted !== "true") {
        errors.push('You must accept the terms to register');
    }
    if(errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
}

module.exports = {
    validateUser,
}
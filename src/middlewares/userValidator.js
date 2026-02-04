const { isStrongPassword } = require('../utils/isStrongPassword')
const {sanitizeString, sanitizeEmail} = require("../utils/sanitize");
const { validateCVR } = require('../utils/validateCVR');

function validateUser(req, res, next) {
    const errors = [];

    let { username, email, password, location, termsAccepted } = req.body;

    if (typeof username === "string"){
        req.body.username = sanitizeString(username.trim());
    }

    if (typeof email === "string") {
        req.body.email = sanitizeEmail(email.trim().toLowerCase());
    }

    if (location && typeof location === "object"){
        if (typeof location.city === "string"){
            req.body.location.city = sanitizeString(location.city.trim());
        }
        if (typeof location.country === "string"){
            req.body.location.country = sanitizeString(location.country.trim());
        }
    }
    if (req.body.cvr && typeof req.body.cvr === "string") {
        req.body.cvr = sanitizeString(req.body.cvr.trim());
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
    if (!isStrongPassword(password)) {
        errors.push("Password must be at least 8 characters and include upper, lower, number and special character"); }
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
    if(req.body.cvr){
        if(!validateCVR(req.body.cvr)){
            errors.push('CVR is not valid');
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
// src/middleware/validateUserUpdate.js

const { sanitizeString } = require("../utils/sanitize");

function validateUserUpdate(req, res, next) {
    const errors = [];

    // ⭐ Saniter og valider adresse hvis den findes
    const address = req.body.profile?.address;

    if (address && typeof address === "object") {

        // Sanitering
        if (typeof address.street === "string") {
            req.body.profile.address.street = sanitizeString(address.street.trim());
        }
        if (typeof address.houseNumber === "string") {
            req.body.profile.address.houseNumber = sanitizeString(address.houseNumber.trim());
        }
        if (typeof address.city === "string") {
            req.body.profile.address.city = sanitizeString(address.city.trim());
        }
        if (typeof address.zip === "string") {
            req.body.profile.address.zip = sanitizeString(address.zip.trim());
        }
        if (typeof address.country === "string") {
            req.body.profile.address.country = sanitizeString(address.country.trim());
        }

        // Validering
        if (!address.street || address.street.length < 2) {
            errors.push("Street address is required.");
        }
        if (!address.houseNumber || address.houseNumber.length < 1) {
            errors.push("House number is required.");
        }
        if (!address.city || address.city.length < 2) {
            errors.push("City is required.");
        }
        if (!address.zip || !/^\d{4}$/.test(address.zip)) {
            errors.push("Zip code must be 4 digits.");
        }
        if (!address.country || address.country.length < 2) {
            errors.push("Country is required.");
        }
    }

    // ⭐ Valider fullname hvis sendt
    if (req.body.profile?.fullName) {
        const fullName = sanitizeString(req.body.profile.fullName.trim());
        req.body.profile.fullName = fullName;

        if (fullName.length < 2) {
            errors.push("Full name must be at least 2 characters.");
        }
    }

    // ⭐ Valider phone hvis sendt
    if (req.body.profile?.phone) {
        const phone = sanitizeString(req.body.profile.phone.trim());
        req.body.profile.phone = phone;

        if (!/^\+?\d{6,15}$/.test(phone)) {
            errors.push("Phone number is not valid.");
        }
    }

    // ⭐ Valider bank info hvis sendt
    if (req.body.bankAccount) {
        const { registrationNumber, accountNumber } = req.body.bankAccount;

        if (!/^\d{4}$/.test(registrationNumber)) {
            errors.push("Registration number must be 4 digits.");
        }
        if (!/^\d{6,10}$/.test(accountNumber)) {
            errors.push("Account number must be between 6 and 10 digits.");
        }
    }

    // ⭐ Returnér fejl hvis der er nogen
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
}

module.exports = { validateUserUpdate };

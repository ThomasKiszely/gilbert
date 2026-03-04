// src/middlewares/validateDiscountCode.js

function validateDiscountCodeInput(data) {
    const errors = [];

    // Code
    if (!data.code || typeof data.code !== "string" || data.code.trim().length === 0) {
        errors.push("Code is required.");
    }

    // Type
    const validTypes = ["percentage", "fixed"];
    if (!validTypes.includes(data.type)) {
        errors.push("Type must be 'percentage' or 'fixed'.");
    }

    // Amount
    if (typeof data.amount !== "number" || data.amount <= 0) {
        errors.push("Amount must be a positive number.");
    }

    // appliesTo
    if (data.appliesTo) {
        if (typeof data.appliesTo.minPrice === "number" && data.appliesTo.minPrice < 0) {
            errors.push("minPrice cannot be negative.");
        }

        if (data.appliesTo.categories && !Array.isArray(data.appliesTo.categories)) {
            errors.push("categories must be an array.");
        }
    }

    // expiresAt
    if (data.expiresAt && isNaN(Date.parse(data.expiresAt))) {
        errors.push("expiresAt must be a valid date.");
    }

    // maxUses
    if (typeof data.maxUses !== "number" || data.maxUses < 0) {
        errors.push("maxUses must be 0 or a positive number.");
    }

    // active
    if (typeof data.active !== "boolean") {
        errors.push("active must be true or false.");
    }

    return errors;
}

module.exports = validateDiscountCodeInput;

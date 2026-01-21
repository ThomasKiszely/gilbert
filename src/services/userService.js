const userRepo = require('../data/userRepo');
const mongoose = require('mongoose');
const { sanitizeString } = require('../utils/sanitize');
const { validateCVR } = require('../utils/validateCVR');
const { professionalStatus } = require('../utils/professionalStatus');

async function updateMe(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid userId`);
    }

    const allowed = [
        "username",
        "email",
        "location.city",
        "location.country",
        "cvr",
        "profile.bio",
        "profile.avatarUrl",
        "profile.language"
    ];

    const update = {};

    for (const key of allowed) {
        const [field, subfield] = key.split(".");

        if (subfield) {
            if (data[field] && data[field][subfield] !== undefined) {
                const value = data[field][subfield];
                update[`${field}.${subfield}`] =
                    typeof value === "string" ? sanitizeString(value) : value;
            }
        } else {
            if (data[key] !== undefined) {
                const value = data[key];
                update[key] =
                    typeof value === "string" ? sanitizeString(value) : value;
            }
        }
    }

    if (update.email) {
        update.isEmailVerified = false;
    }

    if (update.cvr) {
        update.cvr = sanitizeString(update.cvr);

        if (!validateCVR(update.cvr)) {
            throw new Error(`Invalid CVR`);
        }

        update.professionalStatus = professionalStatus.pending;
    }

    if (Object.keys(update).length === 0) {
        throw new Error("No valid fields to update");
    }

    update.updatedAt = new Date();

    const updated = await userRepo.updateUser(id, update);
    if (!updated) {
        throw new Error("User not found");
    }

    return updated;
}

async function getMe(id) {
    return userRepo.findUserById(id);
}

async function updateUser(id, update) {
    return userRepo.updateUser(id, update);
}

module.exports = {
    updateUser,
    updateMe,
    getMe
};

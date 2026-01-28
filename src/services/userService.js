const userRepo = require('../data/userRepo');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mailer = require('../utils/mailer');
const { sanitizeString } = require('../utils/sanitize');
const { validateCVR } = require('../utils/validateCVR');
const { professionalStatus } = require('../utils/professionalStatus');
const { isStrongPassword } = require('../utils/isStrongPassword');
const { sanitizeUser } = require('../utils/sanitizeUser');

async function updateMe(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid userId`);
    }

    const allowed = [
        "username",
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

        // ⭐ Avatar URL må IKKE saniteres
        if (key === "profile.avatarUrl") {
            if (data.profile && data.profile.avatarUrl) {
                update["profile.avatarUrl"] = data.profile.avatarUrl;
            }
            continue;
        }

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


    const updated = await userRepo.updateUser(id, update);
    if (!updated) {
        throw new Error("User not found");
    }

    return sanitizeUser(updated);
}

async function getMe(id) {
    const user = await userRepo.findUserById(id);
    return sanitizeUser(user);
}

async function updateUser(id, update) {
    const user = await userRepo.updateUser(id, update);
    return sanitizeUser(user);
}

async function changePassword(userId, currentPassword, newPassword, confirmPassword) {
    const user = await userRepo.findUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
        throw new Error("Current password is incorrect");
    }
    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
    }
    if (!isStrongPassword(newPassword)) {
        throw new Error("Password must be at least 8 characters and include upper, lower, number and special character");
    }
    if (newPassword === currentPassword) {
        throw new Error("Password must not be the same as the old password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await userRepo.updateUser(userId, {
        passwordHash: hashedPassword
    });

    return true;
}

async function requestEmailChange(userId, currentPassword, newEmail, confirmEmail) {
    const user = await userRepo.findUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
        throw new Error("Password is incorrect");
    }
    if (newEmail !== confirmEmail) {
        throw new Error("Emails do not match");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        throw new Error("Invalid email format");
    }

    const existing = await userRepo.findUserByEmail(newEmail);
    if (existing) {
        throw new Error("Email is already in use");
    }
    const token = crypto.randomBytes(32).toString("hex");
    await userRepo.updateUser(userId, {
        pendingEmail: newEmail,
        emailChangeToken: token,
        emailChangeExpires: Date.now() + 1000 * 60 * 60,
    });

    const verifyUrl = `${process.env.BASE_URL}/api/users/verify-email-change?token=${token}`;
    await mailer.send({
        to: newEmail,
        subject: "Confirm your new email",
        html: ` <h1>Confirm your new email</h1> 
                <p>Click the link below to confirm your new email address:</p> 
                <p><a href="${verifyUrl}">${verifyUrl}</a></p> 
                <p>If you did not request this, you can ignore this email.</p> `
    });
    return true;
}

async function verifyEmailChange(token) {
    if (!token) {
        throw new Error("Invalid token");
    }
    const user = await userRepo.findUserByToken(token);
    if (!user) {
        throw new Error("Invalid or expired token");
    }
    if (user.emailChangeExpires < Date.now()) {
        throw new Error("Token has expired");
    }
    const newEmail = user.pendingEmail;

    const existing = await userRepo.findUserByEmail(newEmail);
    if (existing && existing._id.toString() !== user._id.toString()) {
        throw new Error("Email is already in use");
    }
    await userRepo.updateUser(user._id, {
        email: newEmail,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
        isEmailVerified: true,
    });
    return true;
}

module.exports = {
    updateUser,
    updateMe,
    getMe,
    changePassword,
    requestEmailChange,
    verifyEmailChange,
};

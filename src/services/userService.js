const userRepo = require('../data/userRepo');
const mongoose = require('mongoose');

async function updateUser(id, data){
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

        if (subfield){
            if(data[field] && data[field][subfield] !== undefined) {
                update[`${field}.${subfield}`] = data[field][subfield];
            }
        } else {
            if (data[key] !== undefined) {
                update[key] = data[key];
            }
        }
    }
    if (update.email){
        update.isEmailVerified = false;
    }

    if (Object.keys(update).length === 0) {
        throw new Error("No valid fields to update");
    }

    update.updatedAt = new Date();

    const updated = await userRepo.updateUser(id, update);
    if(!updated) {
        throw new Error("User not found");
    }
    return updated;
}


module.exports = {
    updateUser,
}
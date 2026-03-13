function sanitizeUser(user) {
    if (!user) {
        return {
            _id: null,
            username: "Unknown User",
            profile: { avatarUrl: "/avatars/Gilbert.jpg" }
        };
    }

    // 1. Lav en kopi
    const obj = user.toJSON ? user.toJSON() : { ...user };

    // Gem vitale felter, som vi IKKE må miste
    const vitalId = obj._id;
    const role = obj.role;
    const isDeleted = obj.deleted;

    // 2. Definition af følsomme felter der SKAL væk
    const sensitiveFields = [
        'passwordHash', 'email', 'phone', 'pendingEmail',
        'emailChangeToken', 'emailChangeExpires',
        'deleteAccountToken', 'deleteAccountExpires', 'stripeAccountId'
    ];

    sensitiveFields.forEach(field => delete obj[field]);

    // 3. Fjern adresse-data fra profil
    if (obj.profile?.address) {
        delete obj.profile.address;
    }

    // 4. Hvis slettet - overskriv, men bevar ID og rolle
    if (isDeleted || role === "deleted") {
        obj.username = "Deleted User";
        obj.profile = obj.profile || {};
        obj.profile.avatarUrl = "/avatars/Gilbert.jpg";
        obj.profile.bio = null;
        obj.cvr = null;
        obj.professionalStatus = "none";
        obj.badges = {
            isProfessional: false,
            isExpertSeller: false,
            isIdVerified: false
        };
    }

    // 5. Sikr at _id og role altid er intakt
    obj._id = vitalId;
    obj.role = role;

    return obj;
}

module.exports = { sanitizeUser };
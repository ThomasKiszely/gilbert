function sanitizeUser(user) {
    if (!user) return null;

    const obj = user.toJSON ? user.toJSON() : { ...user };

    // ❌ Følsomme felter fjernes altid
    delete obj.passwordHash;
    delete obj.email;
    delete obj.pendingEmail;
    delete obj.emailChangeToken;
    delete obj.emailChangeExpires;
    delete obj.deleteAccountToken;
    delete obj.deleteAccountExpires;
    delete obj.stripeAccountId;
    delete obj.location;
    delete obj.suspensionReason; // følsomt

    // ❌ Fjern adresse (shipping)
    if (obj.profile && obj.profile.address) {
        delete obj.profile.address;
    }

    // ⭐ SLETTET BRUGER → anonymiser
    if (obj.deleted || obj.role === "deleted") {
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

    return obj;
}

module.exports = {
    sanitizeUser,
};

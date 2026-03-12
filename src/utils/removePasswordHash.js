function removePasswordHash(user) {
    if (!user) return null;

    const obj = user.toJSON ? user.toJSON() : { ...user };

    // Fjern kun følsomme sikkerhedstokens
    delete obj.passwordHash;
    delete obj.emailChangeToken;
    delete obj.emailChangeExpires;
    delete obj.pendingEmail;
    delete obj.deleteAccountToken;
    delete obj.deleteAccountExpires;

    return obj;
}

module.exports = {
    removePasswordHash,
};

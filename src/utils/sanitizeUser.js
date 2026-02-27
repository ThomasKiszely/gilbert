function sanitizeUser(user) {
    if (!user) return null;

    const obj = user.toJSON ? user.toJSON() : { ...user };

    delete obj.passwordHash;
    delete obj.emailChangeToken;
    delete obj.emailChangeExpires;
    delete obj.pendingEmail;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;

    return obj;
}

module.exports = {
    sanitizeUser,
}
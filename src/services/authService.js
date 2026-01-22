const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRepo = require("../data/userRepo");
const mailer = require("../utils/mailer");
const { professionalStatus} = require("../utils/professionalStatus"); //tilføj mail-service
const { userRoles } = require("../utils/userRoles");
const { sanitizeUser } = require("../utils/sanitizeUser");

function createToken(user) {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

async function register({ username, email, password, location, termsAccepted, cvr }) {
    const existing = await userRepo.findUserByEmail(email.toLowerCase());
    if (existing) {
        throw new Error("Email already exists");
    }

    if (!termsAccepted){
        throw new Error("Terms must be accepted");
    }

    let proStat = professionalStatus.none;

    if (cvr){
        proStat = professionalStatus.pending;
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepo.createUser({
        username,
        email: email.toLowerCase(),
        passwordHash,
        role: userRoles.private,
        location,
        termsAccepted,
        termsAcceptedAt: new Date(),
        isEmailVerified: false,
        cvr: cvr,
        professionalStatus: proStat,
        termsVersion: process.env.TERMS_VERSION
    });

    const safeUser = sanitizeUser(user);
    return safeUser;
}

async function login(email, password) {
    const user = await userRepo.findUserByEmail(email.toLowerCase());
    if (!user) {
        throw new Error("Wrong email or password");
    }
    if (user.termsVersion !== process.env.TERMS_VERSION) {
        const err = new Error("New terms must be accepted");
        err.code = "TERMS_OUTDATED";
        throw err;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Wrong email or password");
    }

    if (!user.isEmailVerified) {
        const err = new Error("Email not verified");
        err.code = "EMAIL_NOT_VERIFIED";
        throw err;
    }

    const token = createToken(user);
    const safeUser = sanitizeUser(user);

    return { token, user: safeUser };
}

function generateEmailVerificationToken(userId) {
    return jwt.sign(
        { userId },
        process.env.EMAIL_SECRET,
        { expiresIn: "1d" }
    );
}

async function sendVerificationEmail(email, token) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await mailer.send({
        to: email,
        subject: "Verification email",
        html: `<p>Klik for at verificere din email:</p><a href="${url}">${url}</a>`
    });
}

async function verifyEmail(token) {
    let payload;

    try{
        payload = jwt.verify(token, process.env.EMAIL_SECRET);
    } catch {
        throw new Error("Invalid or expired verification token");
    }

    const updated = await userRepo.updateUser(payload.userId, {
        isEmailVerified: true
    });

    if (!updated) {
        throw new Error("User not found");
    }
    return updated;
}

async function resendVerificationEmail(email) {
    const user = await userRepo.findUserByEmail(email.toLowerCase());

    // Af sikkerhedsgrunde: returnér bare success, selv hvis user ikke findes
    if (!user) return;

    // Hvis allerede verificeret → ingen grund til at sende mail
    if (user.isEmailVerified) return;

    // Generér ny token
    const token = generateEmailVerificationToken(user._id);

    // Send email (virker når du engang har maileren)
    await sendVerificationEmail(user.email, token);
}

async function acceptTerms(userId){
    const updated = await userRepo.updateUser(userId, {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        termsVersion: process.env.TERMS_VERSION
    });
    if (!updated) {
        throw new Error("User not found");
    }
    return updated;
}

function generatePasswordResetToken(userId) {
    return jwt.sign(
        { userId },
        process.env.PASSWORD_RESET_SECRET,
        { expiresIn: "1h" }
    );
}

async function requestPasswordReset(email) {
    const user = await userRepo.findUserByEmail(email.toLowerCase());
    if(!user) return;

    const token = generatePasswordResetToken(user._id);

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await mailer.send({
        to: user.email,
        subject: "Reset your Password",
        html: `
                <p>Click to reset your password: </p>
                <a href="${url}">${url}</a>`,
    });
}

async function resetPassword(token, newPassword) {
    let payload;
    try{
        payload = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);
    } catch {
        throw new Error("Invalid or expired reset token");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updated = await userRepo.updateUser(payload.userId, {
        passwordHash
    });
    if (!updated) {
        throw new Error("User not found");
    }
    return updated;
}


module.exports = {
    register,
    login,
    generateEmailVerificationToken,
    sendVerificationEmail,
    verifyEmail,
    resendVerificationEmail,
    acceptTerms,
    resetPassword,
    requestPasswordReset
};

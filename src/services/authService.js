const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRepo = require("../data/userRepo");
const mailer = require("../utils/mailer"); //tilføj mail-service

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

async function register({ username, email, password, location }) {
    const existing = await userRepo.findUserByEmail(email.toLowerCase());
    if (existing) {
        throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepo.createUser({
        username,
        email: email.toLowerCase(),
        passwordHash,
        location,
        isEmailVerified: false
    });

    return user;
}

async function login(email, password) {
    const user = await userRepo.findUserByEmail(email.toLowerCase());
    if (!user) {
        throw new Error("Forkert email eller password");
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Forkert email eller password");
    }

    if (!user.isEmailVerified) {
        throw new Error("Email not verified");
    }

    const token = createToken(user);

    return { token, user };
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


module.exports = {
    register,
    login,
    generateEmailVerificationToken,
    sendVerificationEmail,
    verifyEmail,
    resendVerificationEmail
};

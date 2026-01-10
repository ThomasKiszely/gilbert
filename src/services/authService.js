const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRepo = require("../data/userRepo");

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
        email,
        passwordHash,
        location
    });

    const token = createToken(user);

    return { token, user };
}

async function login(email, password) {
    const user = await userRepo.findUserByEmail(email);
    if (!user) {
        throw new Error("Forkert email eller password");
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Forkert email eller password");
    }

    const token = createToken(user);

    return { token, user };
}

module.exports = { register, login };

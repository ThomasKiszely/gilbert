const authService = require('../services/authService');


async function register(req, res, next) {
    try {
        const { username, email, password, confirmPassword, location } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const { token, user } = await authService.register({
            username,
            email,
            password,
            location
        });

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, // 1 time
        });

        return res.status(201).json({
            success: true,
            data: user,
        });

    } catch (error) {
        next(error);
    }
}


async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.login(email, password);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60,
        });

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Du er nu logget ud",
        });
    } catch (error) {
        next(error);
    }
}


module.exports = { register, login, logout };

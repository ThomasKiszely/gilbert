const authService = require('../services/authService');

async function register(req, res, next) {
    try {
        const { username, email, password, confirmPassword, location, termsAccepted } = req.body;

        if (password !== confirmPassword) {
            const err = new Error("Passwords do not match");
            err.status = 400;
            return next(err);
        }
        if(!termsAccepted) {
            const err = new Error("Terms must be accepted");
            err.status = 400;
            return next(err);
        }

        const user = await authService.register({
            username,
            email,
            password,
            location,
            termsAccepted,
        });

        const verifyToken = await authService.generateEmailVerificationToken(user._id);

        await authService.sendVerificationEmail(user.email, verifyToken);

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
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

async function verifyEmail(req, res, next) {
    try{
        const { token } = req.query;
        await authService.verifyEmail(token);
        return res.status(200).json({ success: true, message: "Email verified successfully." });
    } catch (error) {
        next(error);
    }
}

async function resendVerificationEmail(req, res, next) {
    try {
        const { email } = req.body;

        await authService.resendVerificationEmail(email);

        return res.status(200).json({
            success: true,
            message: "If the email exists and is not verified, a new verification email has been sent."
        });

    } catch (error) {
        next(error);
    }
}

async function acceptTerms(req, res, next) {
    try{
        const userId = req.user.id;
        await authService.acceptTerms(userId);
        return res.status(200).json({ success: true, message: "Terms accepted successfully." });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    acceptTerms,
};

const jwt = require("jsonwebtoken");
const userRepo = require("../data/userRepo");
const { isProduction } = require("../utils/isProduction");

async function refresh(req, res, next) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "No refresh token" });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        } catch {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        const user = await userRepo.findUserById(payload.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newAccessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("authToken", newAccessToken, {
            httpOnly: true,
            secure: isProduction(),
            sameSite: "lax",
            maxAge: 60 * 60 * 1000
        });

        return res.json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { refresh };

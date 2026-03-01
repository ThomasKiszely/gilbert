const userRepo = require('../data/userRepo');
const { PUBLIC_API_ROUTES } = require('../utils/public_api_routes');
const jwt = require("jsonwebtoken");

async function requireAuth(req, res, next) {
    try {
        let url = req.originalUrl.split("?")[0].split("#")[0];
        if (url.endsWith("/") && url !== "/") url = url.slice(0, -1);

        if (!url.startsWith("/api/")) return next();

        console.log("REQUIRE AUTH API");

        const token = req.cookies.authToken;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const user = await userRepo.findUserById(decoded.id);
        if (!user) return res.status(401).json({ error: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error: " + error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    requireAuth,
};

const userRepo = require('../data/userRepo');
const { PUBLIC_VIEWS } = require('../utils/public_views');          // fx ["index", "login", ...]
const { PUBLIC_API_ROUTES } = require('../utils/public_api_routes'); // fx ["/api/auth/login", ...]

async function requireAuth(req, res, next) {
    try {
        // Normaliser URL
        let url = req.originalUrl.split("?")[0].split("#")[0];

        // Fjern trailing slash (men ikke "/" selv)
        if (url.endsWith("/") && url !== "/") {
            url = url.slice(0, -1);
        }

        // Kun API-ruter skal tjekkes
        if (!url.startsWith("/api/")) {
            return next();
        }

        // Public API endpoints
        if (PUBLIC_API_ROUTES.includes(url)) {
            return next();
        }

        // Protected API endpoints
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await userRepo.findUserById(req.user.id);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}



function requireRole(...roles) {
    return function (req, res, next) {
        const isApiRoute = req.originalUrl.toLowerCase().startsWith('/api/');

        if (!req.user || !roles.includes(req.user.role)) {
            if (isApiRoute) {
                return res.status(403).json({ error: "forbidden" });
            }
            return res.redirect('/');
        }

        next();
    };
}

module.exports = {
    requireAuth,
    requireRole,
};

function requireRole(role) {
    return function (req, res, next) {
        // req.user er sat af requireAuth
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }

        next();
    };
}

module.exports = { requireRole };

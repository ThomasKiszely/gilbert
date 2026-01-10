function requireRole(...roles) {
    return function (req, res, next) {
        const isApiRoute = req.originalUrl.toLowerCase().startsWith('/api/');

        if (!req.user || !roles.includes(req.user.role)) {
            if (isApiRoute) {
                return res.status(403).json({error: "forbidden"})
            } else {
                return res.redirect('/');
            }
        }
        next();
    }
}

module.exports = {
    requireRole,
}

/* bruges sådan her:
router.get("/admin", requireRole("admin"), adminController.dashboard);
router.get("/team", requireRole("gilbert"), teamController.dashboard);
router.get("/super", requireRole("admin", "gilbert"), superController.dashboard);

*/

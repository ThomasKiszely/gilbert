const jwt = require('jsonwebtoken');
const userRepo = require('../data/userRepo');

async function requireAuth(req, res, next) {
    try{
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userRepo.findUserById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch(error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

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
    requireAuth,
}

/* bruges sådan her:
router.get("/admin", requireRole("admin"), adminController.dashboard);
router.get("/team", requireRole("gilbert"), teamController.dashboard);
router.get("/super", requireRole("admin", "gilbert"), superController.dashboard);

*/

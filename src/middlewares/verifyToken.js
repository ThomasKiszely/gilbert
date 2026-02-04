/*const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        // Token er ugyldig → fjern cookie
        res.clearCookie("token");
        req.user = null;
    }

    next();
}

module.exports = { verifyToken };
*/
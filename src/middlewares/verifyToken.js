const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const token = req.cookies?.jwt;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        req.user = null;
    }

    next();
}

module.exports = { verifyToken };

function canUpdateUser(req, res, next) {
    const id = req.params.id;

    if(!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.id !== id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Not allowed to update this user" });
    }

    next();
}

module.exports = {
    canUpdateUser,
}
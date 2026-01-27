const userRepo = require('../data/userRepo');

async function canSell(req, res, next) {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, errors: ["Not authenticated"] });
        }

        // Hent altid frisk user fra DB
        const user = await userRepo.findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, errors: ["User not found"] });
        }

        const errors = [];

        // Tjek profil
        if (!user.profile) {
            errors.push("Need a profile to be able to sell");
        }

        // Tjek location
        if (!user.location || !user.location.city || !user.location.country) {
            errors.push("Need a location on profile to be able to sell");
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // Alt OK
        next();

    } catch (err) {
        console.error("canSell error:", err);
        return res.status(500).json({ success: false, errors: ["Server error"] });
    }
}

module.exports = { canSell };

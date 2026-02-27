const userRepo = require('../data/userRepo');

async function canCreateListing(req, res, next) {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                errors: ["Not authenticated"]
            });
        }

        const user = await userRepo.findUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                errors: ["User not found"]
            });
        }

        const errors = [];

        // 1. Seller profile must exist
        const sp = user.sellerProfile;
        if (!sp) {
            errors.push("Seller profile is missing");
        } else {
            // 2. Seller profile must be complete
            if (!sp.isComplete) {
                errors.push("Seller profile is not complete");
            }

            // 3. Address validation
            if (!sp.address ||
                !sp.address.street ||
                !sp.address.city ||
                !sp.address.postalCode ||
                !sp.address.country) {
                errors.push("Address information is incomplete");
            }

            // 4. Bank validation
            if (!sp.bankAccount ||
                !sp.bankAccount.registrationNumber ||
                !sp.bankAccount.accountNumber) {
                errors.push("Bank information is incomplete");
            }
        }

        // 5. Location must exist (from main profile)
        if (!user.location || !user.location.city || !user.location.country) {
            errors.push("Location is required to create listings");
        }

        // 6. Optional: Check if user is suspended
        if (user.isSuspended) {
            errors.push("Your account is suspended and cannot create listings");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        next();

    } catch (err) {
        console.error("canCreateListing error:", err);
        return res.status(500).json({
            success: false,
            errors: ["Server error"]
        });
    }
}

module.exports = { canCreateListing };

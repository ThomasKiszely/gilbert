const productRepo = require('../data/productRepo');
const userRepo = require("../data/userRepo");
const { sanitizeUser } = require('../utils/sanitizeUser');
const mailer = require('../utils/mailer');

async function updateStatusProduct(productId, status) {
    return await productRepo.updateStatusProduct(productId, status);
}

async function adminGetAllProducts(page, limit) {
    return await productRepo.adminGetAllProducts(page, limit);
}

async function getProductsInReview() {
    return await productRepo.getProductsInReview();
}

async function getAllUsersPaginated(page, limit) {
    return await userRepo.getAllUsersPaginated(page, limit);
}

async function getUserById(id) {
    const user = await userRepo.findUserById(id);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function updateProfessionalStatus(id, professionalStatus) {
    const user = await userRepo.updateProfessionalStatus(id, professionalStatus);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function updateUserBadges(id, badges) {
    const user = await userRepo.updateUserBadges(id, badges);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function updateUserRole(id, role) {
    const user = await userRepo.updateUserRole(id, role);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function toggleUserSuspension(id, isSuspended, reason) {
    const user = await userRepo.toggleUserSuspension(id, isSuspended, reason);

    if (!user) {
        throw new Error("User not found");
    }

    if (isSuspended) {
        await productRepo.updateManyProductsStatus(id, 'Suspended');

        try {
            await mailer.send({
                to: user.email,
                subject: "Important notice regarding your account",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
                        <h2 style="color: #800020;">Account Suspension Notice</h2>
                        <p>Hello ${user.username || 'User'},</p>
                        <p>We are writing to inform you that your account on Gilbert has been suspended with immediate effect.</p>
                        <div style="background: #f4f4f4; padding: 15px; border-left: 4px solid #800020; margin: 20px 0;">
                            <strong>Reason for suspension:</strong><br />
                            ${reason || "Violation of our community guidelines."}
                        </div>
                        <p>As a result of this suspension:</p>
                        <ul>
                            <li>Your active listings have been hidden from the marketplace.</li>
                            <li>You are restricted from creating new listings.</li>
                            <li>You cannot send messages to other users.</li>
                        </ul>
                        <p>If you believe this is a mistake, please contact our support team by replying to this email.</p>
                        <br />
                        <p>Best regards,<br />The Gilbert Team</p>
                    </div>
                `
            });
        } catch (err) {
            console.error("Failed to send suspension email:", err);
        }
    } else {
        await productRepo.updateManyProductsStatus(id, 'In Review');

        try {
            await mailer.send({
                to: user.email,
                subject: "Your account has been reinstated",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
                        <h2 style="color: #2e7d32;">Account Reinstated</h2>
                        <p>Hello ${user.username || 'User'},</p>
                        <p>We are pleased to inform you that your account on Gilbert has been reinstated.</p>
                        <p>Your previous listings have been moved to <strong>In Review</strong> and will be visible on the marketplace once they have been verified by our team.</p>
                        <p>You can now resume creating new listings and sending messages.</p>
                        <p>Thank you for your patience.</p>
                        <br />
                        <p>Best regards,<br />The Gilbert Team</p>
                    </div>
                `
            });
        } catch (err) {
            console.error("Failed to send reinstatement email:", err);
        }
    }

    return sanitizeUser(user);
}

module.exports = {
    updateStatusProduct,
    adminGetAllProducts,
    getProductsInReview,
    getAllUsersPaginated,
    getUserById,
    updateProfessionalStatus,
    updateUserBadges,
    updateUserRole,
    toggleUserSuspension,
}
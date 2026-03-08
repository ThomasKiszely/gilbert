const productRepo = require('../data/productRepo');
const userRepo = require("../data/userRepo");
const orderRepo = require("../data/orderRepo");
const shippingService = require("../services/shippingService");
const { sanitizeUser } = require('../utils/sanitizeUser');
const mailer = require('../utils/mailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const notificationService = require('../services/notificationService');
const notificationTypes = require('../utils/notificationTypes');


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
    // Vi kalder to funktioner i repoet samtidigt
    const [result, pendingCount] = await Promise.all([
        userRepo.getAllUsersPaginated(page, limit),
        userRepo.countPendingProfessionalUsers()
    ]);

    // Vi returnerer det samlede objekt inklusiv pendingCount
    return {
        ...result,
        pendingCount
    };
}

async function getUserById(id) {
    const user = await userRepo.findUserById(id);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function updateProfessionalStatus(id, professionalStatus) {
    const user = await userRepo.updateProfessionalStatus(id, professionalStatus);
    if (professionalStatus === "approved") {
        await notificationService.notifyUser(id, {
            type: notificationTypes.professional_approved
        });
    }

    if (professionalStatus === "rejected") {
        await notificationService.notifyUser(id, {
            type: notificationTypes.professional_rejected
        });
    }
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

async function retryShippingLabel(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    const result = await shippingService.createShipmondoLabel(orderId);

    if (!result) {
        // Mail til admin
        await mailer.send({
            to: process.env.ADMIN_EMAIL,
            subject: `⚠️ Shipmondo retry FAILED (Order: ${orderId})`,
            html: `
                <h2>Shipmondo retry failed</h2>
                <p>Order: <strong>${orderId}</strong></p>
                <p>Check shippingError in the database.</p>
            `
        });

        // Mail til sælger
        await mailer.send({
            to: order.seller.email,
            subject: `Your order cannot be shipped yet (Order: ${orderId})`,
            html: `
                <p>Hello ${order.seller.username},</p>
                <p>We could not create a shipping label for your order yet.</p>
                <p>Gilbert is working on a solution.</p>
            `
        });

        return {
            message: "Shipmondo failed again. Seller and admin have been notified.",
            error: true
        };
    }

    await mailer.send({
        to: order.seller.email,
        subject: `Your shipping label is ready (Order: ${orderId})`,
        html: `
            <p>Hello ${order.seller.username},</p>
            <p>Your shipping label has now been created successfully.</p>
            <p>Tracking number: <strong>${result.tracking_number}</strong></p>
        `
    });

    return {
        message: "Shipping label created successfully.",
        data: result
    };
}
async function getAllOrders(filters) {
    const { status, hasError } = filters;
    let query = {};

    if (hasError === 'true') {
        query.shippingError = { $ne: null };
    }

    if (status) {
        // Hvis status indeholder et komma (f.eks. "disputed,awaiting_return")
        if (status.includes(',')) {
            const statusArray = status.split(',');
            query.status = { $in: statusArray }; // Finder alle ordrer der matcher en af disse
        } else {
            query.status = status; // Finder kun den ene specifikke status
        }
    }

    // Her taler servicen med repoet
    return await orderRepo.findAllOrders(query);
}

async function getOrderDetails(orderId) {
    // Vi bruger orderRepo til at hente den dybe data
    const order = await orderRepo.findOrderById(orderId);

    if (!order) return null;

    // Her kunne vi tilføje ekstra admin-logik,
    // f.eks. tjekke om pengene stadig er "reserved" hos Stripe

    return order;
}
async function resolveDispute(orderId, resolution, reason = "") {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== 'disputed') {
        throw new Error("Order is not in dispute");
    }

    // A) Admin giver køber ret → refund / cancel
    if (resolution === 'refund_buyer') {
        // PaymentIntent er ikke captured (manual), så vi canceller den
        const cancelResult = await stripe.paymentIntents.cancel(order.stripePaymentIntentId);

        await orderRepo.updateOrderStatus(orderId, 'cancelled');

        // Mail til køber
        try {
            await mailer.send({
                to: order.buyer.email,
                subject: "Your dispute has been resolved in your favor",
                html: `
                    <p>Your dispute for order <strong>${orderId}</strong> has been resolved in your favor.</p>
                    <p>You will receive a refund (or release of reserved funds) shortly.</p>
                    <p>Reason: ${reason}</p>
                `
            });
        } catch (err) {
            console.error("Failed to notify buyer about dispute resolution:", err.message);
        }

        // Mail til sælger
        try {
            await mailer.send({
                to: order.seller.email,
                subject: "Dispute resolved in favor of the buyer",
                html: `
                    <p>The dispute for order <strong>${orderId}</strong> has been resolved in favor of the buyer.</p>
                    <p>Reason: ${reason}</p>
                `
            });
        } catch (err) {
            console.error("Failed to notify seller about dispute resolution:", err.message);
        }

        return {
            success: true,
            action: 'refund_buyer',
            cancelResult
        };
    }

    // B) Admin giver sælger ret → payout
    if (resolution === 'payout_seller') {
        const capture = await stripe.paymentIntents.capture(order.stripePaymentIntentId);

        await orderRepo.updateOrderAsPaidOut(orderId, capture.id);

        // Mail til køber
        try {
            await mailer.send({
                to: order.buyer.email,
                subject: "Dispute resolved in favor of the seller",
                html: `
                    <p>The dispute for order <strong>${orderId}</strong> has been resolved in favor of the seller.</p>
                    <p>Reason: ${reason}</p>
                `
            });
        } catch (err) {
            console.error("Failed to notify buyer about dispute resolution:", err.message);
        }

        // Mail til sælger
        try {
            await mailer.send({
                to: order.seller.email,
                subject: "Your dispute has been resolved in your favor",
                html: `
                    <p>The dispute for order <strong>${orderId}</strong> has been resolved in your favor.</p>
                    <p>You will receive your payout shortly.</p>
                    <p>Reason: ${reason}</p>
                `
            });
        } catch (err) {
            console.error("Failed to notify seller about dispute resolution:", err.message);
        }

        return {
            success: true,
            action: 'payout_seller',
            capture
        };
    }

    throw new Error("Invalid resolution type");
}

async function requestReturn(orderId, reason = "") {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== 'disputed') {
        throw new Error("Order must be in dispute to request a return");
    }

    // ⭐ Sæt status til awaiting_return
    await orderRepo.updateOrderStatus(orderId, 'awaiting_return');

    // ⭐ Send mail til køber
    await mailer.send({
        to: order.buyer.email,
        subject: "Please return the item for inspection",
        html: `
            <p>We need to inspect the item for order <strong>${orderId}</strong>.</p>
            <p>Please send it to:</p>
            <p><strong>${process.env.RETURN_ADDRESS}</strong></p>
            <p>Reason: ${reason}</p>
            <p>Once we receive the item, we will complete the dispute review.</p>
        `
    });

    return { success: true, message: "Return requested" };
}

async function markOrderDeliveredToBuyer(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    // Kun authentication-ordrer må bruge denne funktion
    if (!order.requiresAuthentication) {
        throw new Error("This order does not require authentication.");
    }

    // Auth skal være passed
    if (order.authenticationStatus !== "passed") {
        throw new Error("Authentication has not been passed yet.");
    }

    // Sæt leveringstidspunkt og start 72 timer
    const deliveredAt = new Date();
    const payoutEligibleAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const updated = await orderRepo.updateOrderStatus(orderId, "delivered");
    updated.deliveredAt = deliveredAt;
    updated.payoutEligibleAt = payoutEligibleAt;

    await updated.save();

    return updated;
}


// ADMIN: get a product by id regardless of status (used for preview)
async function getProductForAdmin(productId) {
    return await productRepo.getProductByIdAny(productId);
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
    retryShippingLabel,
    getAllOrders,
    getOrderDetails,
    resolveDispute,
    requestReturn,
    markOrderDeliveredToBuyer,
    getProductForAdmin,
}
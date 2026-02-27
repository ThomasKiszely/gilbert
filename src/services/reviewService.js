const reviewRepo = require('../data/reviewRepo');
const orderRepo = require('../data/orderRepo');
const { buyerSellerRoles } = require('../utils/buyerSellerRoles');
const { sanitizeString } = require('../utils/sanitize');

async function createReview(orderId, reviewerId, reviewData) {
    const order = await orderRepo.findOrderById(orderId);

    if (!order) {
        throw new Error("Ordren blev ikke fundet.");
    }

    // 1. Valider status
    if (order.status !== 'completed') {
        throw new Error("Du kan kun anmelde en fuldført handel.");
    }

    // 2. NYT: Tjek om denne bruger allerede har anmeldt denne ordre
    const existing = await reviewRepo.findReviewByOrderAndReviewer(orderId, reviewerId);
    if (existing) {
        throw new Error("Du har allerede anmeldt denne handel.");
    }

    // 3. Tjek deltagelse
    const isBuyer = order.buyer._id.toString() === reviewerId.toString();
    const isSeller = order.seller._id.toString() === reviewerId.toString();

    if (!isBuyer && !isSeller) {
        throw new Error("Du har ikke tilladelse til at anmelde denne handel.");
    }

    // 4. Bestem roller
    const targetUser = isBuyer ? order.seller._id : order.buyer._id;
    const role = isBuyer ? buyerSellerRoles.buyer : buyerSellerRoles.seller;

    const cleanComment = reviewData.comment ? sanitizeString(reviewData.comment) : "";

    // 5. Gem via Repo
    return await reviewRepo.createReview({
        order: orderId,
        reviewer: reviewerId,
        targetUser: targetUser,
        role: role,
        rating: reviewData.rating,
        comment: cleanComment
    });
}

async function getReviewsForUser(userId) {
    return await reviewRepo.getReviewsForUser(userId);
}

module.exports = {
    getReviewsForUser,
    createReview,
};
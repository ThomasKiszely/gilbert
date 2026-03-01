const Review = require('../models/Review');

/**
 * Gemmer en ny anmeldelse i databasen
 */
async function createReview(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
}

/**
 * Bruges til at tjekke om en bruger allerede har anmeldt en specifik ordre
 */
async function findReviewByOrderAndReviewer(orderId, reviewerId) {
    return await Review.findOne({
        order: orderId,
        reviewer: reviewerId
    });
}

/**
 * Henter alle anmeldelser for en specifik bruger (targetUser)
 * Bruges til at vise anmeldelser på profilen
 */
async function getReviewsForUser(userId) {
    return await Review.find({ targetUser: userId })
        .populate('reviewer', 'username profile.avatarUrl') // Rettet fra 'avatar' til 'profile.avatarUrl'
        .sort({ createdAt: -1 })
        .lean();
}

/**
 * Beregner gennemsnitsrating for en bruger (Valgfri men god til profilen)
 */
async function getAverageRating(userId) {
    const result = await Review.aggregate([
        { $match: { targetUser: userId } },
        { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);
    return result.length > 0 ? result[0].average : 0;
}

module.exports = {
    createReview,
    findReviewByOrderAndReviewer,
    getReviewsForUser,
    getAverageRating
};
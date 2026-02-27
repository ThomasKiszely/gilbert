const reviewService = require('../services/reviewService');

async function addReview(req, res, next) {
    try {
        const { orderId } = req.params;
        const { rating, comment } = req.body;
        const reviewerId = req.user._id;

        const review = await reviewService.createReview(orderId, reviewerId, { rating, comment });

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        next(error);
    }
}

async function getUserReviews(req, res, next) {
    try {
        const { userId } = req.params;
        const reviews = await reviewService.getReviewsForUser(userId);

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addReview,
    getUserReviews
};
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const reviewController = require('../controllers/reviewController');


router.get('/user/:userId', reviewController.getUserReviews);
router.post('/:orderId', requireAuth, reviewController.addReview);

module.exports = router;
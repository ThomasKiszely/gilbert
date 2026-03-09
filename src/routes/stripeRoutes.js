const express = require('express');
const router = express.Router();
const { connectStripe, getStripeStatus } = require('../controllers/stripeController');
const { requireAuth } = require('../middlewares/auth');

router.post('/connect', requireAuth, connectStripe);
router.get('/status', requireAuth, getStripeStatus);

module.exports = router;

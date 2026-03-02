const express = require('express');
const router = express.Router();
const { connectStripe } = require('../controllers/stripeController');
const { requireAuth } = require('../middlewares/auth');

router.post('/connect', requireAuth, connectStripe);

module.exports = router;

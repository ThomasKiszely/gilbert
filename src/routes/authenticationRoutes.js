const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const { requireAuth } = require('../middlewares/auth');

router.post('/:orderId/approve', authenticationController.approveAuthentication);
router.post('/:orderId/fail', authenticationController.failAuthentication);

module.exports = router;

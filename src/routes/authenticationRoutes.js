const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');

//Gilbert skal kalde denne ved authentication
router.post('/verify/:orderId', authenticationController.verifyAuthentication);

module.exports = router;

const express = require('express');
const router = express.Router();

const sizeController = require('../controllers/sizeController');

router.post('/', sizeController.createSize);

module.exports = router;
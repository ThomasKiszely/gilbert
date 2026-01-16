const express = require('express');
const router = express.Router();

const materialController = require('../controllers/materialController');

router.post('/', materialController.createMaterial);

module.exports = router;
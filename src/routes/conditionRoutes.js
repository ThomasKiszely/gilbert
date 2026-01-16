const express = require('express');
const router = express.Router();

const conditionController = require('../controllers/conditionController');

router.post('/', conditionController.createCondition);

module.exports = router;
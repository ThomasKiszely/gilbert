const express = require('express');
const router = express.Router();

const conditionController = require('../controllers/conditionController');

router.get('/', conditionController.readAllConditions);

router.post('/', conditionController.createCondition);

module.exports = router;
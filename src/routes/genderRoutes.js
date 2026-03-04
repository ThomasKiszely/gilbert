const express = require('express');
const router = express.Router();
const genderController = require('../controllers/genderController');

router.get('/', genderController.readAllGenders);
router.post('/', genderController.createGender);

module.exports = router;


const express = require('express');
const router = express.Router();

const subcategoryController = require('../controllers/subcategoryController');

router.get('/', subcategoryController.readAllSubcategories);

router.post('/', subcategoryController.createSubcategory);

module.exports = router;
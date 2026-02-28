const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.readAllCategories);

router.post('/', categoryController.createCategory);

router.get("/full", categoryController.getFullCategoryTree);

module.exports = router;
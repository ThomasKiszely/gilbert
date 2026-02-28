const express = require('express');
const router = express.Router();

const brandController = require('../controllers/brandController');


router.get('/', brandController.readAllBrands);
router.get('/:id', brandController.getBrandById);
router.post('/', brandController.createBrand);

module.exports = router;
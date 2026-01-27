const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { requireRole } = require('../middlewares/auth');

router.use(requireRole("admin"));

router.get('/products', adminController.getAllProducts);
router.get('/products/in-review', adminController.getProductsInReview);

router.put('/products/:id/approve',adminController.approveProduct);
router.put('/products/:id/reject', adminController.rejectProduct);

module.exports = router;

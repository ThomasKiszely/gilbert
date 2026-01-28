const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { requireRole } = require('../middlewares/auth');
const { validateUserRole } = require('../middlewares/validateUserRole');
const { validateProfessionalStatus } = require('../middlewares/validateprofessionalStatus');
const { validateUserBadges } = require('../middlewares/validateUserBadges');

router.use(requireRole("admin"));


router.put('/users/:id/role', validateUserRole, adminController.updateUserRole);
router.put('/users/:id/professional', validateProfessionalStatus, adminController.updateProfessionalStatus);
router.put('/users/:id/badges', validateUserBadges, adminController.updateUserBadges);
router.get('/users/:id', adminController.getUserById);
router.get('/users', adminController.getAllUsersPaginated);
router.get('/products', adminController.getAllProducts);
router.get('/products/in-review', adminController.getProductsInReview);

router.put('/products/:id/approve',adminController.approveProduct);
router.put('/products/:id/reject', adminController.rejectProduct);

module.exports = router;

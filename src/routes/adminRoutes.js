const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { validateUserRole } = require('../middlewares/validateUserRole');
const { validateProfessionalStatus } = require('../middlewares/validateprofessionalStatus');
const { validateUserBadges } = require('../middlewares/validateUserBadges');
const {validateUserSuspension} = require("../middlewares/validateUserSuspension");
const {requireRole} = require("../middlewares/requireRole");

router.use(requireRole("admin"));


router.put('/users/:id/role', validateUserRole, adminController.updateUserRole);
router.put('/users/:id/professional', validateProfessionalStatus, adminController.updateProfessionalStatus);
router.put('/users/:id/badges', validateUserBadges, adminController.updateUserBadges);
router.put('/users/suspend/:id', validateUserSuspension, adminController.toggleUserSuspension);
router.get('/users/:id', adminController.getUserById);
router.get('/users', adminController.getAllUsersPaginated);
router.get('/products', adminController.getAllProducts);
router.get('/products/in-review', adminController.getProductsInReview);

// Admin preview GET product by id
router.get('/products/:id', adminController.getProductById);

router.put('/products/:id/approve',adminController.approveProduct);
router.put('/products/:id/reject', adminController.rejectProduct);

// Hent ordrer med filtre (f.eks. kun dem med shipping-fejl eller disputes)
router.get('/orders', adminController.getAllOrders);

// Specifik ordre detaljer (inklusiv Stripe status og Shipmondo fejl)
router.get('/orders/:id', adminController.getOrderDetails);
// Mark order as delivered to buyer (after authentication)
router.post('/orders/:id/mark-delivered', adminController.markOrderDeliveredToBuyer);


// Håndtering af autentificering (Sneakers/Luksusvarer)
//router.put('/orders/:id/authenticate', adminController.updateAuthStatus);

// Afgørelse af disputes (Refund køber / Betal sælger)
router.post('/orders/:id/resolve-dispute', adminController.resolveDispute);
router.post('/orders/:id/request-return', adminController.requestReturn);


//Retry Shipmondo label
router.post('/orders/:id/retry-shipping', adminController.retryShippingLabel);

router.delete('/users/:id', userController.deleteUser)

module.exports = router;

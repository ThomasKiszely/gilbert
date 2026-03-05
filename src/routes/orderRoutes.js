const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middlewares/auth');

// Webhook skal IKKE have requireAuth, og den bruger rawBody fra app.js
router.post('/webhook', orderController.handleStripeWebhook);
router.post('/shipmondo-webhook', orderController.handleShipmondoWebhook);


// Ruterne skal matche navnene i din controller
router.post('/create', requireAuth, orderController.initiateOrder);
router.post('/:id/approve-delivery', requireAuth, orderController.approveDelivery);
router.post( '/:orderId/confirm-pickup', requireAuth, orderController.confirmPickup);
router.get('/my-orders', requireAuth, orderController.getMyOrders);
router.get('/:id', requireAuth, orderController.getOrderById);
router.get('/my-sales', requireAuth, orderController.getMySales);

// Husk ruten til dispute, så køberen kan stoppe udbetalingen
router.post('/:id/dispute', requireAuth, orderController.openOrderDispute);

module.exports = router;
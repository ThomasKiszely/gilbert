const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middlewares/auth');

// 1. STATISKE RUTER (Disse skal ligge øverst!)
router.get('/my-orders', requireAuth, orderController.getMyOrders);
router.get('/my-sales', requireAuth, orderController.getMySales);
router.post('/create', requireAuth, orderController.initiateOrder);

// Hent pakkelabel (PDF download)
router.get('/:id/label', requireAuth, orderController.downloadLabel);


// 2. DYNAMISKE RUTER (Disse skal ligge nederst)
router.get('/:id', requireAuth, orderController.getOrderById);
router.post('/:id/approve-delivery', requireAuth, orderController.approveDelivery);
router.post('/:orderId/confirm-pickup', requireAuth, orderController.confirmPickup);
router.post('/:id/dispute', requireAuth, orderController.openOrderDispute);

module.exports = router;
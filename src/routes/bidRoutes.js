const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { validateBid, validateCounterBid }  = require('../middlewares/validateBid');
const { requireAuth } = require('../middlewares/auth');


router.use(requireAuth);

router.post("/:productId", validateBid, bidController.placeBid);

router.post('/:bidId/reject', bidController.rejectBid);
router.post('/:bidId/accept', bidController.acceptBid);
router.post('/:bidId/counter', validateCounterBid, bidController.counterBid);

router.post('/:bidId/accept-counter', bidController.acceptCounterBid);
router.post('/:bidId/reject-counter', bidController.rejectCounterBid);

// bidRoutes.js
router.get('/active-in-thread/:threadId', bidController.getActiveBidForThread);

module.exports = router;

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/:id', notificationController.getNotificationById);
router.get('/', notificationController.getNotifications);
router.post('/:id/read', notificationController.markAsRead);

module.exports = router;
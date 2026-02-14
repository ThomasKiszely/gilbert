const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middlewares/auth');
const { validateMessage } = require('../middlewares/validateMessage');

router.use(requireAuth);

router.post('/:id', validateMessage, chatController.sendMessage);
router.get('/threads', chatController.getThreads);
router.get('/threads/:threadId', chatController.getThreadById);
router.get('/:threadId/messages', chatController.getMessages);

module.exports = router;
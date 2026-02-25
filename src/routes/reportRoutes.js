const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');

router.use(requireAuth);
router.get('/reportReasons', reportController.getReportReasons)
router.post('/', reportController.createReport);


router.use(requireRole('admin'));
router.get('/pending', reportController.getPendingReports);
router.put('/:id', reportController.updateReport);

module.exports = router;
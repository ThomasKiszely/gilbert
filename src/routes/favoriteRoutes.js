const express = require('express');
const router = express.Router();
const { validateFavorite } = require('../middlewares/favoriteValidator');
const { requireAuth } = require('../middlewares/auth');
const favoriteController = require('../controllers/favoriteController');


router.patch('/:productId', requireAuth, validateFavorite, favoriteController.toggleFavorite);
router.get('/', requireAuth, favoriteController.getFavorites);

module.exports = router;
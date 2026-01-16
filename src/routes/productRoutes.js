const express = require('express');
const router = express.Router();

const { requireAuth} = require('../middlewares/auth');
const { canSell} = require('../middlewares/sellerValidator');
const {validateProduct, loadProduct, yourProduct} = require('../middlewares/productValidator');

const productController = require('../controllers/productController');

router.get('/', productController.readAllProducts);
router.get('/search', productController.findProducts);
router.get('/:id', productController.getProductById);

router.post('/', requireAuth, canSell, validateProduct ,productController.createProduct);

router.put('/:id', requireAuth, loadProduct, yourProduct, validateProduct ,productController.updateProduct);

router.delete('/:id',  requireAuth , loadProduct, yourProduct ,productController.deleteProduct);

module.exports = router;
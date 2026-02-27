const express = require('express');
const router = express.Router();
const upload = require("../middlewares/productUpload");
const { requireAuth} = require('../middlewares/auth');
const { canSell} = require('../middlewares/sellerValidator');
const { canCreateListing } = require('../middlewares/canCreateListing');
const {validateProduct, loadProduct, yourProduct} = require('../middlewares/productValidator');

const productController = require('../controllers/productController');

router.get('/', productController.readAllProducts);
router.post('/', requireAuth,  canSell, canCreateListing ,upload.array("images", 4) , validateProduct ,productController.createProduct);
router.get('/filter', productController.filterProducts);

router.get('/user/:id', productController.getProductsBySeller);

router.get('/:id', productController.getProductById);
router.put('/:id', requireAuth,  loadProduct, yourProduct, validateProduct ,productController.updateProduct);

router.delete('/:id',  requireAuth , loadProduct, yourProduct ,productController.deleteProduct);

module.exports = router;
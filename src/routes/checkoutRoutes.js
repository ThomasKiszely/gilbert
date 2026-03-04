const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
const checkoutController = require("../controllers/checkoutController");

router.post("/calculate", requireAuth, checkoutController.calculateCheckout);

module.exports = router;

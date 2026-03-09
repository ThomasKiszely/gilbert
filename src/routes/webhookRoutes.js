const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Da vi har defineret 'express.raw' i app.js, skal vi bare definere ruten her
router.post("/stripe", orderController.handleStripeWebhook);

// Hvis du har shipmondo, så lav en separat app.use i app.js til den også
router.post("/shipmondo", orderController.handleShipmondoWebhook);

module.exports = router;
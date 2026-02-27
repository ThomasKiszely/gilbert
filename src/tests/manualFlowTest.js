// src/tests/manualFlowTest.js
require('dotenv').config();
const mongoose = require('mongoose');

// Kør testen med:
// node src/tests/manualFlowTest.js

// ⭐ MOCK STRIPE (skal ske FØR services importeres)
require.cache[require.resolve('stripe')] = {
    exports: () => ({
        paymentIntents: {
            create: async (data) => {
                console.log("MOCK: Stripe paymentIntent.create called");
                return {
                    id: "pi_mock_created_123",
                    client_secret: "mock_client_secret_123",
                    ...data
                };
            },
            capture: async () => {
                console.log("MOCK: Stripe capture called");
                return { id: "mock_capture_123" };
            }
        }
    })
};


// ⭐ Registrér ALLE modeller (ellers fejler populate)
require('../models/User');
require('../models/Product');
require('../models/Category');
require('../models/Brand');
require('../models/Color');
require('../models/Condition');
require('../models/Material');
require('../models/Size');
require('../models/Subcategory');
require('../models/Tag');
require('../models/Order');

// Import services EFTER Stripe er mock'et og modeller er registreret
const orderService = require('../services/orderService');
const authenticationService = require('../services/authenticationService');
const orderRepo = require('../data/orderRepo');
const Order = require('../models/Order');

// ⭐ MOCK SHIPMONDO
const shippingService = require('../services/shippingService');
shippingService.createShipmondoLabel = async (orderId) => {
    console.log("MOCK: Shipmondo label created for order", orderId);
    return {
        tracking_number: "MOCK123",
        base64: "mock_label",
        id: "mock_shipmondo_id"
    };
};

(async () => {
    // ⭐ Brug din rigtige DB_URL
    await mongoose.connect(process.env.DB_URL);

    console.log("=== TEST START ===");

    // ⭐ Brug dine egne IDs
    const productId = "69728d2f00f3cf0f7f32666c";
    const buyerId = "696a395b0abc159dc8fe8c35"; // Køber
    const sellerId = "696c199a2b771828037d874c"; // Sælger (produktets ejer)

    // 1) Opret ordre (med authentication)
    const orderResult = await orderService.initiateOrder(productId, buyerId, null, true);
    console.log("Order created:", orderResult.order._id);

    // 2) Simulér Stripe webhook
    await orderService.handlePaymentIntentSucceeded({
        id: "pi_mock_123",
        metadata: { orderId: orderResult.order._id },
        billing_details: { name: "Test Buyer" }
    });
    console.log("Order marked as paid");

    // 3) Simulér levering
    await orderRepo.markAsDelivered(orderResult.order._id);
    console.log("Order marked as delivered");

    // 4) Simulér 72 timer
    await Order.findByIdAndUpdate(orderResult.order._id, {
        payoutEligibleAt: new Date(Date.now() - 1000)
    });
    console.log("72 hours simulated");

    // 5) Kør cron manuelt
    await orderService.processEligiblePayouts();
    console.log("Cron payout processed");

    // 6A) Simulér authentication verified
    await authenticationService.verifyAuthentication(
        orderResult.order._id,
        "verified",
        "Alt ser fint ud"
    );
    console.log("Authentication verified");

    // 7A) Hent endelig ordre
    const finalOrderVerified = await orderRepo.findOrderById(orderResult.order._id);
    console.log("FINAL ORDER (verified):", finalOrderVerified);

    // ⭐ NY TEST: Authentication FAILED
    console.log("\n=== TEST: AUTHENTICATION FAILED ===");

    // Opret ny ordre til failed-test
    const failedOrderResult = await orderService.initiateOrder(productId, buyerId, null, true);
    console.log("Order created:", failedOrderResult.order._id);

    // Simulér webhook
    await orderService.handlePaymentIntentSucceeded({
        id: "pi_mock_456",
        metadata: { orderId: failedOrderResult.order._id },
        billing_details: { name: "Test Buyer" }
    });

    // Simulér levering
    await orderRepo.markAsDelivered(failedOrderResult.order._id);

    // Simulér 72 timer
    await Order.findByIdAndUpdate(failedOrderResult.order._id, {
        payoutEligibleAt: new Date(Date.now() - 1000)
    });

    // ⭐ Authentication FAILED
    await authenticationService.verifyAuthentication(
        failedOrderResult.order._id,
        "failed",
        "Fake vare fundet"
    );
    console.log("Authentication failed");

    // Kør cron igen → payout må IKKE ske
    await orderService.processEligiblePayouts();

    // Hent endelig ordre
    const finalOrderFailed = await orderRepo.findOrderById(failedOrderResult.order._id);
    console.log("FINAL ORDER (failed):", finalOrderFailed);

    console.log("=== TEST DONE ===");
    process.exit();
})();

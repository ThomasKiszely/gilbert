// src/tests/shipmondoFlowTest.js
require('dotenv').config({path: '../../.env'});
const mongoose = require('mongoose');

// Kør testen med:
// node src/tests/shipmondoFlowTest.js

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

// ⭐ Registrér ALLE modeller
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

// Import services EFTER Stripe er mock'et
const orderService = require('../services/orderService');
const orderRepo = require('../data/orderRepo');
const Order = require('../models/Order');

// ⭐ MOCK SHIPMONDO LABEL CREATION
const shippingService = require('../services/shippingService');
shippingService.createShipmondoLabel = async (orderId) => {
    console.log("MOCK: Shipmondo label created for order", orderId);

    const mockResponse = {
        tracking_number: "MOCK123",
        base64: "mock_label",
        id: "mock_shipmondo_id",
        order_id: "SHIPMONDO_TEST_001"
    };

    // ⭐ VIGTIGT: Gem shipmondoOrderId i databasen
    await orderRepo.updateOrderShipping(orderId, {
        trackingNumber: mockResponse.tracking_number,
        labelUrl: mockResponse.base64,
        externalId: mockResponse.id,
        orderId: mockResponse.order_id,
        shippingError: null
    });

    return mockResponse;
};


(async () => {
    await mongoose.connect(process.env.DB_URL);

    console.log("=== SHIPMONDO FLOW TEST START ===");

    // ⭐ Brug dine egne IDs
    const productId = "69728d2f00f3cf0f7f32666c";
    const buyerId = "696a395b0abc159dc8fe8c35";

    // 1) Opret ordre
    const address = {
        name: "Test Buyer",
        street: "Testvej 1",
        houseNumber: "1",
        city: "Testby",
        zip: "1234",
        country: "Denmark"
    };

    const orderResult = await orderService.initiateOrder(productId, buyerId, address);
    console.log("Order created:", orderResult.order._id);

    // 2) Simulér Stripe webhook
    await orderService.handlePaymentIntentSucceeded({
        id: "pi_mock_123",
        metadata: { orderId: orderResult.order._id }
    });
    console.log("Order marked as paid");

    // 3) Simulér Shipmondo label (mock)
    //await shippingService.createShipmondoLabel(orderResult.order._id);

    // 4) Simulér Shipmondo webhook (leveret)
    await orderService.handleShipmondoWebhook({
        webhook: "Webhook1",
        data: {
            order_id: "SHIPMONDO_TEST_001",
            order_status: "delivered"
        }
    });
    console.log("Shipmondo webhook simulated → order delivered");

    // 5) Simulér 72 timer
    await Order.findByIdAndUpdate(orderResult.order._id, {
        payoutEligibleAt: new Date(Date.now() - 1000)
    });
    console.log("72 hours simulated");

    // 6) Kør cron manuelt
    await orderService.processEligiblePayouts();
    console.log("Cron payout processed");

    // 7) Hent endelig ordre
    const finalOrder = await orderRepo.findOrderById(orderResult.order._id);
    console.log("FINAL ORDER:", finalOrder);

    console.log("=== SHIPMONDO FLOW TEST DONE ===");
    process.exit();
})();

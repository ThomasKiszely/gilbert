require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

// Kør testen med:
// node src/tests/authFlowTest.js

// --- MOCK STRIPE ---
require.cache[require.resolve('stripe')] = {
    exports: () => ({
        paymentIntents: {
            create: async () => ({
                id: "pi_mock_created_123",
                client_secret: "mock_client_secret_123"
            }),
            cancel: async () => {
                console.log("MOCK: Stripe PaymentIntent CANCELLED");
                return { id: "pi_mock_cancelled_123" };
            },
            capture: async () => {
                console.log("MOCK: Stripe PaymentIntent CAPTURED");
                return { id: "pi_mock_capture_123" };
            }
        }
    })
};

// --- LOAD MODELS ---
require('../models/User');
require('../models/Product');
require('../models/Order');

// --- IMPORT SERVICES ---
const orderService = require('../services/orderService');
const authenticationService = require('../services/authenticationService');
const orderRepo = require('../data/orderRepo');
const shippingService = require('../services/shippingService');

// --- MOCK SHIPMONDO ---
shippingService.createShipmondoLabel = async (orderId) => {
    console.log("MOCK: Shipmondo label created for order", orderId);

    const mockResponse = {
        tracking_number: "MOCK123",
        base64: "mock_label",
        id: "mock_shipmondo_id",
        order_id: "SHIPMONDO_TEST_001"
    };

    await orderRepo.updateOrderShipping(orderId, {
        trackingNumber: mockResponse.tracking_number,
        labelUrl: mockResponse.base64,
        externalId: mockResponse.id,
        orderId: mockResponse.order_id,
        shippingError: null
    });

    return mockResponse;
};

shippingService.createForwardLabel = async (orderId) => {
    console.log("MOCK: Forward label created for order", orderId);

    const mockResponse = {
        tracking_number: "MOCK_FORWARD_123",
        base64: "mock_forward_label",
        id: "mock_forward_shipmondo_id",
        order_id: "SHIPMONDO_FORWARD_001"
    };

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

    console.log("=== AUTHENTICATION FLOW TEST START ===");

    const productId = "PUT_REAL_PRODUCT_ID_HERE";
    const buyerId = "PUT_REAL_BUYER_ID_HERE";

    const address = {
        name: "Test Buyer",
        street: "Testvej 1",
        houseNumber: "1",
        city: "Testby",
        zip: "1234",
        country: "Denmark"
    };

    // --- CREATE ORDER ---
    const orderResult = await orderService.initiateOrder(productId, buyerId, address);
    const orderId = orderResult.order._id;
    console.log("Order created:", orderId);

    // --- STRIPE WEBHOOK ---
    await orderService.handlePaymentIntentSucceeded({
        id: "pi_mock_123",
        metadata: { orderId }
    });
    console.log("Order marked as paid");

    // --- SHIPMONDO WEBHOOK: delivered to Gilbert ---
    await orderService.handleShipmondoWebhook({
        shipment: {
            id: "mock_shipmondo_id",
            status: "delivered"
        }
    });
    console.log("Delivered to Gilbert → authentication pending");

    // --- ADMIN APPROVES AUTHENTICATION ---
    const approveResult = await authenticationService.handleAuthenticationPassed(orderId);
    console.log("Authentication approved:", approveResult);

    // --- SHIPMONDO WEBHOOK: delivered to buyer ---
    await orderService.handleShipmondoWebhook({
        shipment: {
            id: "mock_forward_shipmondo_id",
            status: "delivered"
        }
    });
    console.log("Delivered to buyer");

    // --- SIMULATE 72 HOURS ---
    await orderRepo.setPayoutEligibleAt(orderId, new Date(Date.now() - 1000));

    // --- RUN CRON ---
    await orderService.processEligiblePayouts();
    console.log("Payout processed");

    // --- FINAL ORDER ---
    const finalOrder = await orderRepo.findOrderById(orderId);
    console.log("FINAL ORDER:", finalOrder);

    console.log("=== APPROVE FLOW DONE ===");

    // --- NOW TEST FAIL FLOW ---
    console.log("\n=== FAIL FLOW TEST START ===");

    const orderResult2 = await orderService.initiateOrder(productId, buyerId, address);
    const orderId2 = orderResult2.order._id;

    await orderService.handlePaymentIntentSucceeded({
        id: "pi_mock_456",
        metadata: { orderId: orderId2 }
    });

    await orderService.handleShipmondoWebhook({
        shipment: {
            id: "mock_shipmondo_id",
            status: "delivered"
        }
    });

    const failResult = await authenticationService.handleAuthenticationFailed(orderId2, "Fake item");
    console.log("Authentication failed:", failResult);

    const finalOrder2 = await orderRepo.findOrderById(orderId2);
    console.log("FINAL FAILED ORDER:", finalOrder2);

    console.log("=== FAIL FLOW TEST DONE ===");

    process.exit();
})();

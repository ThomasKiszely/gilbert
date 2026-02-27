// testShipping.js
require('dotenv').config();
const mongoose = require('mongoose');

require('./src/models/User');
require('./src/models/Product');
require('./src/models/Order');
require('./src/models/Category');

const orderService = require('./src/services/orderService');

// Erstat med en rigtig ordre-ID fra din database (en der er 'pending')
const TEST_ORDER_ID = '69a17c0c37b564cd346f35d8';

async function simulateSuccess() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to DB...");

        // Vi simulerer det objekt Stripe sender ved succes
        const mockStripeSession = {
            client_reference_id: TEST_ORDER_ID,
            payment_intent: 'pi_test_123',
            shipping_details: {
                name: 'Anders And',
                address: {
                    line1: 'Paradisæblevej 13',
                    city: 'Andeby',
                    postal_code: '1234',
                    country: 'DK'
                }
            }
        };

        console.log("Simulerer webhook fra Stripe...");
        const result = await orderService.handleStripeCheckoutCompleted(mockStripeSession);

        console.log("✅ Test fuldført!");
        console.log("Tjek din database - ordren skal nu have status 'paid' og en vægt svarende til produktet.");

    } catch (err) {
        console.error("❌ Test fejlede:", err.message);
    } finally {
        mongoose.connection.close();
    }
}

simulateSuccess();
// src/services/shippingService.js
const axios = require('axios');
const orderRepo = require('../data/orderRepo');
const { GILBERT_SHIPPING_ADDRESS } = require('../utils/platformSettings');

const SHIPMONDO_API_USER = process.env.SHIPMONDO_API_USER;
const SHIPMONDO_API_KEY = process.env.SHIPMONDO_API_KEY;
const SHIPMONDO_ENDPOINT = 'https://app.shipmondo.com/api/public/v3/shipments';

const DEFAULT_CARRIER_CODE = process.env.SHIPMONDO_CARRIER_CODE || 'dao';
const DEFAULT_PRODUCT_CODE = process.env.SHIPMONDO_PRODUCT_CODE || 'dao_home';
const DEFAULT_SERVICE_ID = parseInt(process.env.SHIPMONDO_SERVICE_ID || '1', 10);

// ⭐ Helper: valider adressefelter
function validateAddress(address, type) {
    if (!address) throw new Error(`${type} address mangler`);

    const required = ['name', 'street', 'zip', 'city'];
    for (const field of required) {
        if (!address[field]) {
            throw new Error(`${type} address mangler felt: ${field}`);
        }
    }
}

// ⭐ Helper: fallback hvis sælger mangler adresse
function getSenderAddress(seller) {
    const addr = seller.profile?.address;

    if (!addr || !addr.street || !addr.zip || !addr.city) {
        return {
            name: seller.username || "Sælger",
            street: "Adresse mangler",
            zip: "0000",
            city: "By mangler",
            country_code: "DK",
            email: seller.email
        };
    }

    return {
        name: seller.username,
        street: addr.street,
        zip: addr.zip,
        city: addr.city,
        country_code: "DK",
        email: seller.email
    };
}

async function createShipmondoLabel(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.requiresAuthentication && order.authenticationStatus === 'passed') {
        throw new Error("Cannot create shipping label after authentication. Gilbert handles forwarding manually.");
    }


    const seller = order.seller;

    // ⭐ Vælg korrekt modtageradresse
    const receiverAddress = order.requiresAuthentication
        ? GILBERT_SHIPPING_ADDRESS
        : order.shippingAddress;

    // ⭐ Valider modtageradresse (kun hvis ikke authentication)
    if (!order.requiresAuthentication) {
        validateAddress(receiverAddress, "Receiver");
    }

    // ⭐ Dynamisk vægt
    const finalWeight = order.product?.weight || 1000;

    const shipmentData = {
        test_mode: process.env.NODE_ENV !== 'production',
        own_agreement: false,
        carrier_code: DEFAULT_CARRIER_CODE,
        product_code: DEFAULT_PRODUCT_CODE,
        service_id: DEFAULT_SERVICE_ID,
        sender: getSenderAddress(seller),
        receiver: {
            name: receiverAddress.name,
            address1: receiverAddress.street,
            zipcode: receiverAddress.zip,
            city: receiverAddress.city,
            country_code: receiverAddress.country_code || 'DK',
            email: order.buyer?.email
        },
        parcels: [
            { weight: finalWeight }
        ]
    };

    try {
        const response = await axios.post(SHIPMONDO_ENDPOINT, shipmentData, {
            auth: {
                username: SHIPMONDO_API_USER,
                password: SHIPMONDO_API_KEY
            }
        });

        await orderRepo.updateOrderShipping(orderId, {
            trackingNumber: response.data.tracking_number,
            labelUrl: response.data.base64,
            externalId: response.data.id,
            shippingError: null,
            orderId: response.data.order_id,
        });

        return response.data;

    } catch (err) {
        console.error("❌ Shipmondo fejl:", err.response?.data || err.message);

        await orderRepo.updateOrderShipping(orderId, {
            shippingError: err.response?.data || err.message
        });

        return null;
    }
}

module.exports = { createShipmondoLabel };

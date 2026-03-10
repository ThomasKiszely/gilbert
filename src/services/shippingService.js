// src/services/shippingService.js
const axios = require('axios');
const orderRepo = require('../data/orderRepo');
const { GILBERT_SHIPPING_ADDRESS } = require('../utils/platformSettings');
const { toCountryCode } = require("../utils/countryUtils");

const IS_PROD = process.env.NODE_ENV === 'production';
const SHIPMONDO_API_USER = IS_PROD ? process.env.SHIPMONDO_API_USER : process.env.SHIPMONDO_API_USER_SANDBOX;
const SHIPMONDO_API_KEY = IS_PROD ? process.env.SHIPMONDO_API_KEY : process.env.SHIPMONDO_API_KEY_SANDBOX;
const SHIPMONDO_ENDPOINT = IS_PROD
    ? 'https://app.shipmondo.com/api/public/v3/shipments'
    : 'https://sandbox.shipmondo.com/api/public/v3/shipments';

function validateAddress(address, type) {
    if (!address) throw new Error(`${type} address mangler`);
    const required = ['name', 'street', 'zip', 'city'];
    for (const field of required) {
        if (!address[field]) throw new Error(`${type} address mangler felt: ${field}`);
    }
}

function buildAddress1(street, houseNumber) {
    return houseNumber ? `${street} ${houseNumber}` : street;
}

// ⭐ Opret Shipmondo label
async function createShipmondoLabel(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const seller = order.seller;
    const receiverAddress = order.requiresAuthentication ? GILBERT_SHIPPING_ADDRESS : order.shippingAddress;

    validateAddress(receiverAddress, "Receiver");
    const finalWeight = Math.max(1, order.product?.weight || 1000);

    const shipmentData = {
        test_mode: !IS_PROD,
        own_agreement: false,
        product_code: "DAO_STH",
        service_codes: "EMAIL_NT",
        reference: orderId,
        label_format: "a4_pdf",
        automatic_select_service_point: true,
        parties: [
            {
                type: "sender",
                name: seller.username || "Gilbert ApS",
                attention: seller.username,
                address1: buildAddress1(seller.profile.address.street, seller.profile.address.houseNumber),
                postal_code: seller.profile.address.zip,
                city: seller.profile.address.city,
                country_code: toCountryCode(seller.profile.address.country),
                email: seller.email
            },
            {
                type: "receiver",
                name: receiverAddress.name,
                attention: receiverAddress.name,
                address1: buildAddress1(receiverAddress.street, receiverAddress.houseNumber),
                postal_code: receiverAddress.zip,
                city: receiverAddress.city,
                country_code: toCountryCode(receiverAddress.country),
                email: order.buyer.email
            }
        ],
        parcels: [{ weight: finalWeight }]
    };

    try {
        console.log("DEBUG: Sender payload til Shipmondo:", JSON.stringify(shipmentData, null, 2));
        const response = await axios.post(SHIPMONDO_ENDPOINT, shipmentData, {
            auth: { username: SHIPMONDO_API_USER, password: SHIPMONDO_API_KEY }
        });

        await orderRepo.updateOrderShipping(orderId, {
            trackingNumber: response.data.tracking_number,
            labelUrl: response.data.label_url || "",
            externalShippingId: response.data.id.toString(),
            shipmondoOrderId: response.data.order_id ? response.data.order_id.toString() : null,
            shippingError: null
        });

        await orderRepo.updateOrderStatus(orderId, 'shipped');
        return response.data;
    } catch (err) {
        const raw = err.response?.data || err;
        console.error("❌ SHIPMONDO FEJL:", JSON.stringify(raw, null, 2));
        await orderRepo.updateOrderShipping(orderId, { shippingError: JSON.stringify(raw) });
        throw err;
    }
}

// ⭐ Opret label fra Gilbert → køber
async function createForwardLabel(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const receiver = order.shippingAddress;
    const sender = GILBERT_SHIPPING_ADDRESS;

    validateAddress(receiver, "Receiver");
    const finalWeight = Math.max(1, order.product?.weight || 1000);

    const shipmentData = {
        test_mode: !IS_PROD,
        own_agreement: false,
        product_code: "DAO_STH",
        service_codes: "EMAIL_NT",
        reference: orderId,
        label_format: "a4_pdf",
        automatic_select_service_point: true,
        parties: [
            {
                type: "sender",
                name: sender.name,
                attention: sender.name,
                address1: buildAddress1(sender.street, sender.houseNumber),
                postal_code: sender.zip,
                city: sender.city,
                country_code: toCountryCode(sender.country),
                email: process.env.ADMIN_EMAIL
            },
            {
                type: "receiver",
                name: receiver.name,
                attention: receiver.name,
                address1: buildAddress1(receiver.street, receiver.houseNumber),
                postal_code: receiver.zip,
                city: receiver.city,
                country_code: toCountryCode(receiver.country),
                email: order.buyer.email
            }
        ],
        parcels: [{ weight: finalWeight }]
    };

    try {
        const response = await axios.post(SHIPMONDO_ENDPOINT, shipmentData, {
            auth: { username: SHIPMONDO_API_USER, password: SHIPMONDO_API_KEY }
        });

        await orderRepo.updateOrderShipping(orderId, {
            trackingNumber: response.data.tracking_number,
            labelUrl: response.data.label_url || "",
            externalShippingId: response.data.id.toString(),
            shipmondoOrderId: response.data.order_id ? response.data.order_id.toString() : null,
            shippingError: null
        });

        await orderRepo.updateOrderStatus(orderId, "shipped_to_buyer");
        return response.data;
    } catch (err) {
        const raw = err.response?.data || err;
        console.error("❌ SHIPMONDO FORWARD FEJL:", JSON.stringify(raw, null, 2));
        throw err;
    }
}

module.exports = { createShipmondoLabel, createForwardLabel };
const axios = require('axios');
const orderRepo = require('../data/orderRepo');
const { GILBERT_SHIPPING_ADDRESS } = require('../utils/platformSettings');


const SHIPMONDO_API_USER = process.env.SHIPMONDO_API_USER;
const SHIPMONDO_API_KEY = process.env.SHIPMONDO_API_KEY;
const SHIPMONDO_ENDPOINT = 'https://app.shipmondo.com/api/public/v3/shipments';

// Disse bør ligge i din .env eller platformSettings
const DEFAULT_CARRIER_CODE = process.env.SHIPMONDO_CARRIER_CODE || 'dao'; // f.eks. 'dao', 'gls', 'bring'
const DEFAULT_PRODUCT_CODE = process.env.SHIPMONDO_PRODUCT_CODE || 'dao_home'; // Pakketype
const DEFAULT_SERVICE_ID = process.env.SHIPMONDO_SERVICE_ID || '1'; // Den specifikke service

async function createShipmondoLabel(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const seller = order.seller;
    const buyerAddress = order.requiresAuthentication
        ? GILBERT_SHIPPING_ADDRESS
        : order.shippingAddress;


    // ⭐ Dynamisk vægt: Vi kigger på produktet på ordren.
    // Hvis vægt mangler på produktet, bruger vi 1000g som backup.
    const finalWeight = order.product?.weight || 1000;

    const shipmentData = {
        test_mode: process.env.NODE_ENV !== 'production',
        own_agreement: false,
        carrier_code: DEFAULT_CARRIER_CODE,
        product_code: DEFAULT_PRODUCT_CODE,
        service_id: parseInt(DEFAULT_SERVICE_ID),
        sender: {
            name: seller.username,
            address1: seller.profile?.address?.street || 'Adresse mangler',
            zipcode: seller.profile?.address?.zip || '0000',
            city: seller.profile?.address?.city || 'By mangler',
            country_code: 'DK',
            email: seller.email
        },
        receiver: {
            name: buyerAddress.name,
            address1: buyerAddress.street,
            zipcode: buyerAddress.zip,
            city: buyerAddress.city,
            country_code: buyerAddress.country_code || 'DK',
            email: order.buyer?.email
        },
        parcels: [{
            weight: finalWeight // ⭐ Nu bliver den dynamiske vægt sendt til Shipmondo
        }]
    };

    const response = await axios.post(SHIPMONDO_ENDPOINT, shipmentData, {
        auth: {
            username: SHIPMONDO_API_USER,
            password: SHIPMONDO_API_KEY
        }
    });

    console.log('Shipmondo Response:', response.data);

    // ⭐ Vi gemmer nu tracking og label-data
    await orderRepo.updateOrderShipping(orderId, {
        trackingNumber: response.data.tracking_number,
        labelUrl: response.data.base64,
        externalId: response.data.id
    });

    return response.data;
}

module.exports = { createShipmondoLabel };
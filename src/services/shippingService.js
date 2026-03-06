// src/services/shippingService.js
const axios = require('axios');
const orderRepo = require('../data/orderRepo');
const { GILBERT_SHIPPING_ADDRESS } = require('../utils/platformSettings');
const shipmondoClient = require("../utils/shipmondoClient");
const { toCountryCode } = require("../utils/countryUtils");


// ⭐ Startup-check: valider hele GILBERT_SHIPPING_ADDRESS
(function validateGilbertAddress() {
    const addr = GILBERT_SHIPPING_ADDRESS;

    if (!addr) {
        console.error("❌ GILBERT_SHIPPING_ADDRESS mangler helt!");
        return;
    }

    const required = ["name", "street", "zip", "city", "country"];
    for (const field of required) {
        if (!addr[field] || typeof addr[field] !== "string" || addr[field].trim().length === 0) {
            console.error(`❌ GILBERT_SHIPPING_ADDRESS mangler feltet '${field}'.`);
            return;
        }
    }

    if (!/^\d{4}$/.test(addr.zip)) {
        console.error(`❌ GILBERT_SHIPPING_ADDRESS.zip er ugyldigt: "${addr.zip}". Skal være 4 cifre.`);
        return;
    }

    const countryCode = toCountryCode(addr.country);

    if (!countryCode) {
        console.error(`❌ GILBERT_SHIPPING_ADDRESS.country er ugyldigt: "${addr.country}".`);
        return;
    }

    console.log(`✅ Gilbert-adresse valideret: ${addr.street}, ${addr.zip} ${addr.city}, ${addr.country} → ${countryCode}`);
})();

const isProd = process.env.NODE_ENV === "production";

const SHIPMONDO_API_USER = isProd
    ? process.env.SHIPMONDO_API_USER
    : process.env.SHIPMONDO_API_USER_SANDBOX;

const SHIPMONDO_API_KEY = isProd
    ? process.env.SHIPMONDO_API_KEY
    : process.env.SHIPMONDO_API_KEY_SANDBOX;

const SHIPMONDO_ENDPOINT = isProd
    ? "https://app.shipmondo.com/api/public/v3/shipments"
    : "https://sandbox.shipmondo.com/api/public/v3/shipments";

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

// ⭐ Helper: valider e-mail
function validateEmail(email, type) {
    if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new Error(`${type} e-mail mangler eller er ugyldig`);
    }
}

// ⭐ Helper: valider telefonnummer
function validatePhone(phone, type) {
    if (phone && !/^\+?[0-9\- ]{7,}$/.test(phone)) {
        throw new Error(`${type} telefonnummer er ugyldigt`);
    }
}

// ⭐ Helper: byg sender-adresse fra sælger
function getSenderAddress(seller) {
    const addr = seller.profile?.address;

    if (!addr || !addr.street || !addr.zip || !addr.city) {
        throw new Error("Sælger mangler adresseoplysninger – kan ikke oprette label.");
    }

    validateEmail(seller.email, "Afsender");
    // Telefon kan evt. tilføjes til seller.profile.phone

    return {
        name: seller.username,
        address1: addr.street + (addr.houseNumber ? ` ${addr.houseNumber}` : ""),
        zipcode: addr.zip,
        city: addr.city,
        country_code: toCountryCode(addr.country),
        email: seller.email,
        // phone: seller.profile?.phone || undefined
    };
}

// ⭐ Helper: byg modtager-adresse fra ordre
function getReceiverAddress(order, receiverAddress) {
    validateEmail(order.buyer?.email, "Modtager");
    // Telefon kan evt. tilføjes til order.buyer.profile.phone

    return {
        name: receiverAddress.name,
        address1: receiverAddress.street + (receiverAddress.houseNumber ? ` ${receiverAddress.houseNumber}` : ""),
        zipcode: receiverAddress.zip,
        city: receiverAddress.city,
        country_code: toCountryCode(receiverAddress.country),
        email: order.buyer?.email,
        // phone: order.buyer?.profile?.phone || undefined
    };
}

async function createShipmondoLabel(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (!order.seller) {
        throw new Error("Seller not found on order");
    }

    if (order.requiresAuthentication && order.authenticationStatus === 'pending') {
        throw new Error("Authentication is still pending. Seller must ship to Gilbert first.");
    }

    if (order.shippingTrackingNumber) {
        throw new Error("Shipping label already exists for this order.");
    }

    const seller = order.seller;

    const receiverAddress = order.requiresAuthentication
        ? GILBERT_SHIPPING_ADDRESS
        : order.shippingAddress;

    validateAddress(receiverAddress, "Receiver");

    const finalWeight = Math.max(1, order.product?.weight || 1000);

    // --- Shipmondo shipmentData ---
    const shipmentData = {
        test_mode: process.env.NODE_ENV !== 'production',
        own_agreement: false,
        carrier_code: DEFAULT_CARRIER_CODE,
        product_code: DEFAULT_PRODUCT_CODE,
        service_id: DEFAULT_SERVICE_ID,
        reference: orderId,
        sender: getSenderAddress(seller),
        receiver: getReceiverAddress(order, receiverAddress),
        parcels: [
            { weight: finalWeight }
        ]
        // Tilføj dimensioner hvis ønsket: length, width, height
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
            externalShippingId: response.data.id,
            shipmondoOrderId: response.data.order_id,
            shippingError: null
        });

        await orderRepo.updateOrderStatus(orderId, 'shipped');

        return response.data;

    } catch (err) {
        const errorDetail = err.response?.data || err.message;
        console.error("❌ Shipmondo fejl:", errorDetail, "\nRequest:", JSON.stringify(shipmentData, null, 2));

        await orderRepo.updateOrderShipping(orderId, {
            shippingError: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)
        });

        return null;
    }
}

async function createForwardLabel(orderId) {
    const order = await orderRepo.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (!order.requiresAuthentication || order.authenticationStatus !== "passed") {
        throw new Error("Order is not ready for forwarding to buyer.");
    }

    const receiver = order.shippingAddress;
    const sender = GILBERT_SHIPPING_ADDRESS;

    validateAddress(receiver, "Receiver");
    validateAddress(sender, "Sender");

    const shipmentData = {
        test_mode: process.env.NODE_ENV !== 'production',
        own_agreement: false,
        carrier_code: DEFAULT_CARRIER_CODE,
        product_code: DEFAULT_PRODUCT_CODE,
        service_id: DEFAULT_SERVICE_ID,
        sender: {
            name: sender.name,
            address1: sender.street,
            zipcode: sender.zip,
            city: sender.city,
            country_code: toCountryCode(sender.country),
            email: process.env.ADMIN_EMAIL
        },
        receiver: {
            name: receiver.name,
            address1: receiver.street,
            zipcode: receiver.zip,
            city: receiver.city,
            country_code: toCountryCode(receiver.country),
            email: order.buyer.email
        },
        parcels: [
            { weight: order.product?.weight || 1000 }
        ]
    };

    const response = await axios.post(SHIPMONDO_ENDPOINT, shipmentData, {
        auth: {
            username: SHIPMONDO_API_USER,
            password: SHIPMONDO_API_KEY
        }
    });

    await orderRepo.updateOrderShipping(orderId, {
        trackingNumber: response.data.tracking_number,
        labelUrl: response.data.base64,
        externalShippingId: response.data.id,
        shipmondoOrderId: response.data.order_id,
        shippingError: null
    });

    await orderRepo.updateOrderStatus(orderId, "shipped_to_buyer");

    return response.data;
}


async function getRate({ fromAddress, toAddress, weight, dimensions }) {
    // Tilpas til jeres faktiske Shipmondo‑client
    const payload = {
        from: fromAddress,
        to: toAddress,
        weight,
        dimensions,
    };

    const res = await shipmondoClient.getRate(payload);
    // Antag res.total er pris i DKK
    return {
        price: res.total,
        raw: res,
    };
}


module.exports = {
    createShipmondoLabel,
    createForwardLabel,
    getRate,
};

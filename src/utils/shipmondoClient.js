const axios = require("axios");
const { toCountryCode } = require("./countryUtils");

const isProd = process.env.NODE_ENV === "production";

const SHIPMONDO_API_USER = isProd
    ? process.env.SHIPMONDO_API_USER
    : process.env.SHIPMONDO_API_USER_SANDBOX;

const SHIPMONDO_API_KEY = isProd
    ? process.env.SHIPMONDO_API_KEY
    : process.env.SHIPMONDO_API_KEY_SANDBOX;

const RATE_ENDPOINT = isProd
    ? "https://app.shipmondo.com/api/public/v3/rates"
    : "https://sandbox.shipmondo.com/api/public/v3/rates";

async function getRate({ from, to, weight, dimensions }) {
    try {
        const payload = {
            sender: {
                address1: from.street + (from.houseNumber ? ` ${from.houseNumber}` : ""),
                zipcode: from.zip,
                city: from.city,
                country_code: toCountryCode(from.country || from.country_code),
            },
            receiver: {
                address1: to.street + (to.houseNumber ? ` ${to.houseNumber}` : ""),
                zipcode: to.zip,
                city: to.city,
                country_code: toCountryCode(to.country || to.country_code),
            },
            parcels: [
                {
                    weight: weight > 0 ? weight : 1000
                }
            ]
        };
        console.log("Shipmondo rate payload:", JSON.stringify(payload, null, 2));
        console.log('Shipmondo endpoint:', RATE_ENDPOINT);
        console.log('Shipmondo user:', SHIPMONDO_API_USER);
        console.log('Node env:', process.env.NODE_ENV);
        const response = await axios.post(RATE_ENDPOINT, payload, {
            auth: {
                username: SHIPMONDO_API_USER,
                password: SHIPMONDO_API_KEY
            }
        });
        console.log("Shipmondo rate response:", JSON.stringify(response.data, null, 2));
        const best = response.data?.rates?.[0];
        if (!best) throw new Error(response.data?.error || "No shipping rates returned from Shipmondo");
        return {
            total: best.total,
            currency: best.currency,
            raw: best
        };
    } catch (err) {
        const shipmondoError = err.response?.data || err.message;
        if (err.response) {
            console.error("❌ Shipmondo rate error:", shipmondoError, "Status:", err.response.status, "Headers:", err.response.headers);
        } else {
            console.error("❌ Shipmondo rate error:", shipmondoError);
        }
        throw new Error(typeof shipmondoError === 'string' ? shipmondoError : JSON.stringify(shipmondoError));
    }
}

module.exports = {
    getRate
};

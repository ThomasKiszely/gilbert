const axios = require("axios");

const SHIPMONDO_API_USER = process.env.SHIPMONDO_API_USER;
const SHIPMONDO_API_KEY = process.env.SHIPMONDO_API_KEY;

const RATE_ENDPOINT = "https://app.shipmondo.com/api/public/v3/rates";

async function getRate({ from, to, weight, dimensions }) {
    try {
        const payload = {
            sender: {
                address1: from.street,
                zipcode: from.zip,
                city: from.city,
                country_code: from.country_code || from.country || "DK"
            },
            receiver: {
                address1: to.street,
                zipcode: to.zip,
                city: to.city,
                country_code: to.country_code || to.country || "DK"
            },
            parcels: [
                {
                    weight: weight || 1000,
                    length: dimensions?.length || 30,
                    width: dimensions?.width || 20,
                    height: dimensions?.height || 10
                }
            ]
        };

        const response = await axios.post(RATE_ENDPOINT, payload, {
            auth: {
                username: SHIPMONDO_API_USER,
                password: SHIPMONDO_API_KEY
            }
        });

        // Shipmondo returnerer en liste af mulige priser
        const best = response.data?.rates?.[0];

        if (!best) {
            throw new Error("No shipping rates returned from Shipmondo");
        }

        return {
            total: best.total,
            currency: best.currency,
            raw: best
        };

    } catch (err) {
        console.error("❌ Shipmondo rate error:", err.response?.data || err.message);
        throw new Error("Failed to fetch shipping rate from Shipmondo");
    }
}

module.exports = {
    getRate
};

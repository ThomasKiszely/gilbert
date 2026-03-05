module.exports = {
    PLATFORM_FEE_PERCENT: 10,
    AUTHENTICATION_FEE: 250,
    AUTH_THRESHOLD: 5000,
    REFUND_WINDOW_HOURS: 72,

    GILBERT_SHIPPING_ADDRESS: {
        name: "Gilbert Authentication ApS",
        street: "Hovedgaden 1",
        houseNumber: "1",
        zip: "1000",
        city: "København K",
        country: "Denmark",
        email: "auth@gilbert.dk"
    },

    // ⭐ Standarddimensioner for alle produkter
    DEFAULT_PACKAGE_DIMENSIONS: {
        length: 35,   // cm
        width: 25,    // cm
        height: 15    // cm
    },

    // ⭐ Maks tilladt pakkestørrelse (til sælger-info)
    MAX_PACKAGE_DIMENSIONS: {
        length: 40,
        width: 30,
        height: 20
    },
    NO_SHIPPING_SUBCATEGORIES: ["furniture"]
};

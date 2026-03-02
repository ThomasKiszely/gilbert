module.exports = {
    PLATFORM_FEE_PERCENT: 10, // Din 10% sats
    AUTHENTICATION_FEE: 250,  // Eksempel: Gebyr for fysisk tjek af varen
    AUTH_THRESHOLD: 5000,    // Grænsen for tvungen authentication
    REFUND_WINDOW_HOURS: 72,   // De 72 timer køber har til at gøre indsigelse
    GILBERT_SHIPPING_ADDRESS: {
        name: "Gilbert Authentication ApS",
        street: "Hovedgaden 1",
        houseNumber: "1",        // valgfrit, men godt at have
        zip: "1000",
        city: "København K",
        country: "Denmark",      // eller "Danmark"
        email: "auth@gilbert.dk"
    }
};
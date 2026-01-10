const { rateLimit } = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minut
    max: 5,              // kun 5 login-forsøg pr. minut
    message: { error: "For mange loginforsøg. Prøv igen senere." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter
};

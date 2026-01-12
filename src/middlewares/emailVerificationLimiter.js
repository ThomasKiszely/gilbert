const { rateLimit } = require('express-rate-limit');

const emailVerificationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, //
    max: 3,              // kun 3 forsøg pr. 10 min
    message: { error: "For mange forsøg. Prøv igen senere." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    emailVerificationLimiter
};

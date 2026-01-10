const rateLimit = require('express-rate-limit');

const limitRate = rateLimit({
    windowMs: 60000,// 60 sekunder
    max: 100,//maks pr ip pr windowsMS
    statusCode: 429,
    message: { "error": 'Too many requests from this IP. Try again later' },
    standardHeaders: true,// den sender tilbage til klienten, fx hvad vinduet er og hvornår det nulstilles osv
    legacyHeaders: false,
});

module.exports = { limitRate };
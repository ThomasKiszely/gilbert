const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const logger = new EventEmitter();
const crypto = require('crypto');

logger.on('log', async (message) => {
    try {
        const timestamp = new Date().toLocaleString('da-DK');
        const logMessage = `${timestamp}: Anmodning: ${message}\n`;

        const logDir = path.join(__dirname, 'logs');
        const date = new Date();
        const dateString = date.toISOString().split('T')[0]; // fx "2025-12-16"
        const logFile = path.join(logDir, `log_${dateString}.txt`);

        await fs.mkdir(logDir, { recursive: true });
        await fs.appendFile(logFile, logMessage);
        console.log(`Log Message Added: ${logMessage}`);
    } catch (error) {
        console.error('Fejl ved logning: ' + error.message);
    }
});

const SENSITIVE_FIELDS = ['password', 'pwd', 'token', 'secret', 'authorization'];

const sanitizeBody = (body) => {
    if (!body || typeof body !== 'object') return body;

    // Hvis det er et array → sanitér hvert element
    if (Array.isArray(body)) {
        return body.map(item => sanitizeBody(item));
    }

    const sanitized = {};
//Object.entries er de key/value par, som er i objektet, fx name: Homer osv...
    for (const [key, value] of Object.entries(body)) {
        if (key.toLowerCase().includes("password") || SENSITIVE_FIELDS.includes(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            // Rekursiv sanitizing for at fjerne fx passwords længere inde i body
            sanitized[key] = sanitizeBody(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};



const truncate = (str, max = 500) => {
    if (!str) return str;
    return str.length > max ? str.substring(0, max) + '... [TRUNCATED]' : str;
};

const log = (req, res, next) => {
    if (req.originalUrl === '/favicon.ico') return next();

    req.requestId = crypto.randomUUID();

    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        const sanitized = sanitizeBody(req.body);
        let body = JSON.stringify(sanitized);
        body = truncate(body);

        logger.emit(
            'log',
            `${req.requestId} ${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${body}`
        );
    });

    next();
};


module.exports = { logger, log };

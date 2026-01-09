const path = require("path");

function errorHandler(error, req, res, next) {
    console.error(error);

    const status = error.status || 500;
    const message = error.message || "Server error";

    if (req.originalUrl.startsWith("/api") || req.headers.accept?.includes("application/json")) {
        return res.status(status).json({ success: false, error: message });
    }

    res.status(status).sendFile(
        path.join(__dirname, '..', '..', 'public', 'errors', '500.html')
    );
}

module.exports = { errorHandler };
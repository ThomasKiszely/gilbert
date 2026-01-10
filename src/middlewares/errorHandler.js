const path = require("path");

function errorHandler(error, req, res, next) {
    console.error(error);

    const status = error.status || 500;
    const message = error.message || "Server error";

    const wantsJson =
        req.originalUrl.startsWith("/api") ||
        req.headers.accept?.includes("application/json");

    if (wantsJson) {
        return res.status(status).json({
            success: false,
            error: message,
        });
    }
    const errorPage = status === 404 ? "404.html" : "500.html";

    res.status(status).sendFile(
        path.join(process.cwd(), 'views', errorPage),
    );
}

module.exports = { errorHandler };
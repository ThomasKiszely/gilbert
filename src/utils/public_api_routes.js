const {requireAuth} = require("../middlewares/auth");
const PUBLIC_API_ROUTES = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgotPassword",
    "/api/auth/resetPassword",
    "/api/auth/verifyEmail",
    "/api/auth/resendVerification",
    "/api/users/verify-email-change",
    "/api/products"
];


module.exports = {
    PUBLIC_API_ROUTES,
}
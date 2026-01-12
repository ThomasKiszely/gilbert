const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/loginLimiter");
const { validateLogin } = require("../middlewares/loginValidator");
const { validateUser } = require("../middlewares/userValidator");
const { emailVerificationLimiter } = require("../middlewares/emailVerificationLimiter");
const { requireAuth } = require("../middlewares/auth");

router.post("/login", loginLimiter, validateLogin, authController.login);
router.post("/register", validateUser, authController.register);
router.post("/logout", authController.logout);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", emailVerificationLimiter, authController.resendVerificationEmail);
router.post("/accept-terms", requireAuth, authController.acceptTerms);


module.exports = router;
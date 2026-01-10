const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/loginLimiter");

router.post("/login", loginLimiter, authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

module.exports = router;
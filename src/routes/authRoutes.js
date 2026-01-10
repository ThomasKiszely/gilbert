const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/loginLimiter");
const { validateLogin } = require("../middlewares/loginValidator");
const { validateUser } = require("../middlewares/userValidator");

router.post("/login", loginLimiter, validateLogin, authController.login);
router.post("/register", validateUser, authController.register);
router.post("/logout", authController.logout);

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const { canUpdateUser } = require("../middlewares/canUpdateUser");
const { verifyToken } = require("../middlewares/verifyToken");


router.patch("/user/:id", verifyToken, canUpdateUser, userController.updateUser);
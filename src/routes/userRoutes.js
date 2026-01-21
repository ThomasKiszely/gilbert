const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const { canUpdateUser } = require("../middlewares/canUpdateUser");
const { requireAuth } = require("../middlewares/auth");


router.patch("/user/:id", canUpdateUser, userController.updateUser);
router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, userController.updateMe);


module.exports = router;
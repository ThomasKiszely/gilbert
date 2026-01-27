const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const { canUpdateUser } = require("../middlewares/canUpdateUser");
const { upload } = require("../middlewares/upload");


router.post("/me/avatar", upload.single("avatar"), userController.updateAvatar);
router.post("/me/password", userController.changePassword);
router.post("/me/email", userController.changeEmail);
router.patch("/user/:id", canUpdateUser, userController.updateUser);
router.get("/verify-email-change", userController.verifyEmailChange);
router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);


module.exports = router;
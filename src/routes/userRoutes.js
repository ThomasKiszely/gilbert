const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const { canUpdateUser } = require("../middlewares/canUpdateUser");
const upload = require("../middlewares/avatarUpload");
const { requireAuth } = require("../middlewares/auth");
const { validateUserUpdate } = require("../middlewares/validateUserUpdate");
const { validateAdminUserUpdate } = require("../middlewares/validateAdminUserUpdate");

router.get("/public/:id", userController.getUserById);
router.get("/verify-email-change", userController.verifyEmailChange);
router.get("/confirm-delete", userController.confirmAccountDeletion);


router.use(requireAuth);

router.post("/me/avatar", upload.single("avatar"), userController.updateAvatar);
router.post("/me/password", userController.changePassword);
router.post("/me/email", userController.changeEmail);
//router.patch("/user/:id", canUpdateUser, validateAdminUserUpdate, userController.updateUser);
router.get("/me", userController.getMe);
router.patch("/me", validateUserUpdate, userController.updateMe);

router.post("/me/request-delete", userController.requestAccountDeletion);


module.exports = router;
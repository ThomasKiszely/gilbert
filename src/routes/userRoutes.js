const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const { canUpdateUser } = require("../middlewares/canUpdateUser");


router.patch("/user/:id", canUpdateUser, userController.updateUser);


module.exports = router;
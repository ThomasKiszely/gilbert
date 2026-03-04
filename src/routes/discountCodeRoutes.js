// src/routes/discountCodeRoutes.js
const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/requireRole"); // hvis du har sådan én
const discountCodeController = require("../controllers/discountCodeController");

router.use(requireAuth, requireRole("admin"));

router.get("/", discountCodeController.listCodes);
router.get("/:id", discountCodeController.getCode);
router.post("/", discountCodeController.createCode);
router.put("/:id", discountCodeController.updateCode);
router.delete("/:id", discountCodeController.deleteCode);

module.exports = router;

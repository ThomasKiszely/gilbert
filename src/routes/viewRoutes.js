const express = require("express");
const router = express.Router();
const { renderView } = require("../controllers/viewController");

// fallback
router.get("/", renderView);
router.get("/:view", renderView);

module.exports = router;

const express = require("express");
const router = express.Router();
const { renderView } = require("../controllers/viewController");


router.get("/:view", renderView);
router.get("/", renderView);


module.exports = router;

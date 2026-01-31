const express = require("express");
const router = express.Router();
const { renderView } = require("../controllers/viewController");


router.get("/edit-product/:id", (req, res, next) => {
    req.params.view = "edit-product";
    next();
}, renderView);

router.get("/", renderView);
router.get("/:view", renderView);

module.exports = router;

const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/:filename", (req, res) => {
    const filePath = path.join(process.cwd(), "uploads", req.params.filename);
    res.sendFile(filePath);
});

module.exports = router;

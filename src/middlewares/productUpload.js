const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: "uploads/products",
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const productUpload = multer({ storage });

module.exports = productUpload;

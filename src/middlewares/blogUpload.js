const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = "uploads/blogs";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: "uploads/blogs",
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const blogUpload = multer({ storage });

module.exports = blogUpload;
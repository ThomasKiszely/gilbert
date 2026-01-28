const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = "uploads/avatars";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: "uploads/avatars",
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const avatarUpload = multer({ storage });

module.exports = avatarUpload;

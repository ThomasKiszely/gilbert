const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const userRepo = require('../data/userRepo');

const PRODUCT_DIR = path.join(__dirname, '../../uploads/products');
const PROFILE_DIR = path.join(__dirname, '../../uploads/avatars');
const BLOG_DIR = path.join(__dirname, '../../uploads/blogs');
function ensureDir(dir) {
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

ensureDir(PRODUCT_DIR);
ensureDir(PROFILE_DIR);

async function saveProductImage(file) {
    const outputFilename = file.filename + ".webp";
    const outputPath = path.join(PRODUCT_DIR, outputFilename);
    await sharp(file.path)
        .resize(1200)
        .webp({ quality: 80 })
        .toFile(outputPath);
    fs.unlinkSync(file.path);
    return `/api/images/products/${outputFilename}`;
}

async function saveBlogImage(file) {
    const outputFilename = file.filename + ".webp";
    const outputPath = path.join(BLOG_DIR, outputFilename);
    await sharp(file.path)
        .resize(1200)
        .webp({ quality: 80 })
        .toFile(outputPath);
    fs.unlinkSync(file.path);
    return `/api/images/blogs/${outputFilename}`;
}

async function saveAvatar(file, userId) {
    const user = await userRepo.findUserById(userId);
    const oldAvatar = user.profile?.avatarUrl;

    if(oldAvatar) {
        await deleteImage(oldAvatar);
    }

    const outputFilename = file.filename + ".webp";
    const outputPath = path.join(PROFILE_DIR, outputFilename);
    await sharp(file.path)
        .resize(400)
        .webp({ quality: 80 })
        .toFile(outputPath);
    fs.unlinkSync(file.path);
    return `/api/images/avatars/${outputFilename}`;
}

async function deleteImage(imageUrl) {
    const filename = imageUrl.split("/").pop();

    let dir;

    if (imageUrl.includes("/products/")) {
        dir = PRODUCT_DIR;
    } else if (imageUrl.includes("/avatars/")) {
        dir = PROFILE_DIR;
    } else {
        return;
    }

    const filePath = path.join(dir, filename);

    if (fs.existsSync(filePath)) {
       await fs.unlinkSync(filePath);
    }
}


module.exports = {
    saveProductImage,
    saveAvatar,
    saveBlogImage,
    deleteImage
}
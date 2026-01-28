const productRepo = require('../data/productRepo');
const userRepo = require("../data/userRepo");
const { sanitizeUser } = require('../utils/sanitizeUser');

async function updateStatusProduct(productId, status) {
    return await productRepo.updateStatusProduct(productId, status);
}

async function adminGetAllProducts(page, limit) {
    return await productRepo.adminGetAllProducts(page, limit);
}

async function getProductsInReview() {
    return await productRepo.getProductsInReview();
}

async function getAllUsersPaginated(page, limit) {
    return await userRepo.getAllUsersPaginated(page, limit);
}

async function getUserById(id) {
    const user = await userRepo.findUserById(id);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function updateProfessionalStatus(id, professionalStatus) {
    const user = await userRepo.updateProfessionalStatus(id, professionalStatus);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function updateUserBadges(id, badges) {
    const user = await userRepo.updateUserBadges(id, badges);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

async function updateUserRole(id, role) {
    const user = await userRepo.updateUserRole(id, role);
    const sanitizedUser = sanitizeUser(user);
    return sanitizedUser;
}

module.exports = {
    updateStatusProduct,
    adminGetAllProducts,
    getProductsInReview,
    getAllUsersPaginated,
    getUserById,
    updateProfessionalStatus,
    updateUserBadges,
    updateUserRole,
}
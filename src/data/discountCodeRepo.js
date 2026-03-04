const DiscountCode = require("../models/DiscountCode");

async function createCode(data) {
    return DiscountCode.create(data);
}

async function updateCode(id, data) {
    return DiscountCode.findByIdAndUpdate(id, data, { new: true });
}

async function deleteCode(id) {
    return DiscountCode.findByIdAndDelete(id);
}

async function getById(id) {
    return DiscountCode.findById(id);
}

async function getByCode(code) {
    return DiscountCode.findOne({ code: code.toUpperCase() });
}

async function listCodes() {
    return DiscountCode.find().sort({ createdAt: -1 });
}

async function incrementUsage(id) {
    return DiscountCode.findByIdAndUpdate(
        id,
        { $inc: { usedCount: 1 } },
        { new: true }
    );
}

module.exports = {
    createCode,
    updateCode,
    deleteCode,
    getById,
    getByCode,
    listCodes,
    incrementUsage,
};

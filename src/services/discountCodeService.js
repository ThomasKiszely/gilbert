const discountCodeRepo = require("../data/discountCodeRepo");
const orderRepo = require("../data/orderRepo");

async function validateAndCalculate({ code, userId, product, basePrice }) {
    if (!code) return { valid: false, reason: "No code provided" };

    const discount = await discountCodeRepo.getByCode(code);
    if (!discount || !discount.active) {
        return { valid: false, reason: "Invalid or inactive code" };
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
        return { valid: false, reason: "Code has expired" };
    }

    if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) {
        return { valid: false, reason: "Code usage limit reached" };
    }

    // Første køb?
    if (discount.appliesTo?.firstPurchaseOnly) {
        const previousOrders = await orderRepo.countOrdersByBuyer(userId);
        if (previousOrders > 0) {
            return { valid: false, reason: "Code only valid for first purchase" };
        }
    }

    // Kategori‑match?
    if (discount.appliesTo?.categories?.length) {
        const category = product.category; // forudsætter product.category
        if (!discount.appliesTo.categories.includes(category)) {
            return { valid: false, reason: "Code not valid for this category" };
        }
    }

    // Min pris?
    if (discount.appliesTo?.minPrice && basePrice < discount.appliesTo.minPrice) {
        return { valid: false, reason: "Order total too low for this code" };
    }

    // Beregn rabat
    let discountAmount = 0;
    if (discount.type === "percentage") {
        discountAmount = Math.round(basePrice * (discount.amount / 100));
    } else {
        discountAmount = discount.amount;
    }

    if (discountAmount > basePrice) discountAmount = basePrice;

    return {
        valid: true,
        discount,
        discountAmount,
    };
}

module.exports = {
    validateAndCalculate,
};

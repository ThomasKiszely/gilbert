const productRepo = require("../data/productRepo");
const shippingService = require("../services/shippingService");
const discountCodeService = require("../services/discountCodeService");
const { AUTH_THRESHOLD, AUTHENTICATION_FEE } = require("../utils/platformSettings");

async function calculateCheckout(req, res, next) {
    try {
        const { productId, discountCode, shippingMethod, address } = req.body;
        const userId = req.user.id;

        const product = await productRepo.getProductById(productId);
        if (!product || product.status !== "Approved") {
            return res.status(400).json({ success: false, message: "Product not available" });
        }

        const basePrice = product.price;

        // ⭐ Fragtpris fra Shipmondo
        const rate = await shippingService.getRate({
            fromAddress: product.seller.profile.address,
            toAddress: address,
            weight: product.weight,
            dimensions: product.dimensions,
            shippingMethod,
        });

        const shippingPrice = rate.price;

        // ⭐ Rabat
        let discountAmount = 0;
        if (discountCode) {
            const result = await discountCodeService.validateAndCalculate({
                code: discountCode,
                userId,
                product,
                basePrice,
            });

            if (result.valid) {
                discountAmount = result.discountAmount;
            }
        }

        // ⭐ Authentication-fee (samme logik som initiateOrder)
        const isAuthForced = basePrice >= AUTH_THRESHOLD;
        const authenticationFee = isAuthForced ? AUTHENTICATION_FEE : 0;

        // ⭐ Total
        const total = basePrice - discountAmount + shippingPrice + authenticationFee;

        return res.json({
            success: true,
            productPrice: basePrice,
            discount: discountAmount,
            shipping: shippingPrice,
            authenticationFee,
            total,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    calculateCheckout,
};

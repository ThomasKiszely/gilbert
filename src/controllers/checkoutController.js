const productRepo = require("../data/productRepo");
const shippingService = require("../services/shippingService");
const discountCodeService = require("../services/discountCodeService");
const {
    AUTH_THRESHOLD,
    AUTHENTICATION_FEE,
    DEFAULT_PACKAGE_DIMENSIONS,
    NO_SHIPPING_SUBCATEGORIES
} = require("../utils/platformSettings");

require('dotenv').config();

async function calculateCheckout(req, res, next) {
    try {
        const { productId, discountCode, shippingMethod, address } = req.body;
        const userId = req.user.id;

        const product = await productRepo.getProductById(productId);
        if (!product || product.status !== "Approved") {
            return res.status(400).json({ success: false, message: "Product not available" });
        }

        // ⭐ Weight validation
        if (
            !product.weight ||
            typeof product.weight !== "number" ||
            product.weight < 100 ||
            product.weight > 20000
        ) {
            return res.status(400).json({
                success: false,
                message: "Product weight is invalid. The seller must correct the product weight before checkout."
            });
        }

        // ⭐ Determine if this is a large item (manual pickup)
        const isLargeItem =
            product.isLargeItem === true ||
            NO_SHIPPING_SUBCATEGORIES?.includes(product.subcategory.toString());

        const basePrice = product.price;

        // ⭐ If large item → skip Shipmondo entirely
        if (isLargeItem) {
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

            const isAuthForced = basePrice >= AUTH_THRESHOLD;
            const authenticationFee = isAuthForced ? AUTHENTICATION_FEE : 0;

            const total = basePrice - discountAmount + authenticationFee;

            return res.json({
                success: true,
                productPrice: basePrice,
                discount: discountAmount,
                shipping: 0,
                shippingType: "manual",
                authenticationFee,
                total,
                message: "This item cannot be shipped. Buyer and seller must arrange pickup or delivery manually."
            });
        }

        // ⭐ Normal Shipmondo flow
        // Fast, stabil og konsistent shipping-pris pr. transportør
        const SHIPPING_PRICES = {
            gls: 49,
            dao: 39,
            postnord: 49
        };

        // ⭐ Fallback til DAO hvis shippingMethod er ukendt
        let shippingPrice = SHIPPING_PRICES[shippingMethod];
        if (!shippingPrice) {
            console.warn(`⚠ Ukendt shippingMethod "${shippingMethod}". Fallback til DAO.`);
            shippingPrice = SHIPPING_PRICES["dao"];
        }

        // ⭐ Discount
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

        // ⭐ Authentication fee
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

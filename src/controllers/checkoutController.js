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

        // Weight validation
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
        let shippingPrice = 0;

        if (process.env.NODE_ENV === 'production') {
            const rate = await shippingService.getRate({
                fromAddress: product.seller.profile.address,
                toAddress: address,
                weight: product.weight,
                dimensions: DEFAULT_PACKAGE_DIMENSIONS,
                shippingMethod,
            });

            shippingPrice = rate.price;
        } else {
            shippingPrice = 50; // test mode
        }

        // Discount
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

        // Authentication fee
        const isAuthForced = basePrice >= AUTH_THRESHOLD;
        const authenticationFee = isAuthForced ? AUTHENTICATION_FEE : 0;

        // Total
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

const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    type: { type: String, enum: ["percentage", "fixed"], required: true },
    amount: { type: Number, required: true }, // fx 10 (% eller kr)

    appliesTo: {
        firstPurchaseOnly: { type: Boolean, default: false },
        categories: [{ type: String }], // fx ["shoes", "sneakers"]
        minPrice: { type: Number, default: 0 }
    },

    expiresAt: { type: Date },
    maxUses: { type: Number, default: 0 }, // 0 = ubegrænset
    usedCount: { type: Number, default: 0 },

    active: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("DiscountCode", discountCodeSchema);

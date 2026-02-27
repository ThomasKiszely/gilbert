const mongoose = require('mongoose');
const { userRoles } = require('../utils/userRoles');
const { professionalStatus } = require('../utils/professionalStatus');
const { encrypt, decrypt } = require("../utils/encrypt");

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true, lowercase: true, trim: true},
    username: {type: String, unique: true, required: true},
    passwordHash: {type: String, required: true},
        sellerProfile: {
            fullName: { type: String },
            phone: { type: String },
            address: {
                street: { type: String },
                city: { type: String },
                postalCode: { type: String },
                country: { type: String },
            },
            bankAccount: {
                registrationNumber: { type: String },  // Reg.nr
                accountNumber: { type: String },        // Kontonr
            },
            isComplete: { type: Boolean, default: false },
            completedAt: { type: Date },
        },

    pendingEmail: {type: String},
    emailChangeToken: {type: String},
    emailChangeExpires: {type: Date},
    role: {type: String, enum: Object.values(userRoles), default: userRoles.private, required: true},
    termsAccepted: {type: Boolean, required: true},
    termsAcceptedAt: {
        type: Date, required: function () {
            return this.termsAccepted === true
        }
    },
    termsVersion: { type: String, default: "1.0.0" },
    location: {
        city: {type: String, required: true},
        country: {type: String, required: true},
    },
    cvr: {type: String},
    professionalStatus: {type: String, enum: Object.values(professionalStatus), default: professionalStatus.none},
    isEmailVerified: {type: Boolean, default: false},
    badges: {
        isProfessional: {type: Boolean, default: false},
        isExpertSeller: {type: Boolean, default: false},
        isIdVerified: {type: Boolean, default: false},
    },
    stats: {
        numberOfSales: {type: Number, default: 0},
        ratingAverage: {type: Number, default: 0},
        ratingCount: {type: Number, default: 0}
    },
    profile: {
        bio: {type: String},
        avatarUrl: {type: String, default: "/avatars/Gilbert.jpg"},
        language: {type: String, default: "en"},
        address: {
            street: { type: String },
            houseNumber: { type: String },
            zip: { type: String },
            city: { type: String },
            country: { type: String, default: "Denmark" }
        }
    },
    isSuspended: {type: Boolean, default: false},
    suspensionReason: {type: String},
    stripeAccountId: {type: String, default: null},
},
{timestamps: true });

userSchema.pre("save", function(next) {
    if (this.isModified("sellerProfile")) {

        // Full name
        if (this.sellerProfile.fullName) {
            this.sellerProfile.fullName = encrypt(this.sellerProfile.fullName);
        }

        // Phone
        if (this.sellerProfile.phone) {
            this.sellerProfile.phone = encrypt(this.sellerProfile.phone);
        }

        // Address
        if (this.sellerProfile.address) {
            const addr = this.sellerProfile.address;
            if (addr.street) addr.street = encrypt(addr.street);
            if (addr.city) addr.city = encrypt(addr.city);
            if (addr.postalCode) addr.postalCode = encrypt(addr.postalCode);
            if (addr.country) addr.country = encrypt(addr.country);
        }

        // Bank account
        if (this.sellerProfile.bankAccount) {
            const bank = this.sellerProfile.bankAccount;
            if (bank.registrationNumber) bank.registrationNumber = encrypt(bank.registrationNumber);
            if (bank.accountNumber) bank.accountNumber = encrypt(bank.accountNumber);
        }
    }

    next();
});
userSchema.pre("findOneAndUpdate", function() {
    const update = this.getUpdate();
    if (!update) return;

    const sp = update.sellerProfile || update.$set?.sellerProfile;
    if (!sp) return;

    // Full name
    if (sp.fullName) sp.fullName = encrypt(sp.fullName);

    // Phone
    if (sp.phone) sp.phone = encrypt(sp.phone);

    // Address
    if (sp.address) {
        if (sp.address.street) sp.address.street = encrypt(sp.address.street);
        if (sp.address.city) sp.address.city = encrypt(sp.address.city);
        if (sp.address.postalCode) sp.address.postalCode = encrypt(sp.address.postalCode);
        if (sp.address.country) sp.address.country = encrypt(sp.address.country);
    }

    // Bank account
    if (sp.bankAccount) {
        if (sp.bankAccount.registrationNumber)
            sp.bankAccount.registrationNumber = encrypt(sp.bankAccount.registrationNumber);

        if (sp.bankAccount.accountNumber)
            sp.bankAccount.accountNumber = encrypt(sp.bankAccount.accountNumber);
    }
});


userSchema.methods.toJSON = function () {
    const obj = this.toObject();

    if (obj.sellerProfile) {
        const sp = obj.sellerProfile;

        if (sp.fullName) sp.fullName = decrypt(sp.fullName);
        if (sp.phone) sp.phone = decrypt(sp.phone);

        if (sp.address) {
            if (sp.address.street) sp.address.street = decrypt(sp.address.street);
            if (sp.address.city) sp.address.city = decrypt(sp.address.city);
            if (sp.address.postalCode) sp.address.postalCode = decrypt(sp.address.postalCode);
            if (sp.address.country) sp.address.country = decrypt(sp.address.country);
        }

        if (sp.bankAccount) {
            if (sp.bankAccount.registrationNumber) sp.bankAccount.registrationNumber = decrypt(sp.bankAccount.registrationNumber);
            if (sp.bankAccount.accountNumber) sp.bankAccount.accountNumber = decrypt(sp.bankAccount.accountNumber);
        }
    }

    return obj;
};

module.exports = mongoose.model("User", userSchema);
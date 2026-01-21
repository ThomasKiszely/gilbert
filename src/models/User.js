const mongoose = require('mongoose');
const { userRoles } = require('../utils/userRoles');
const { professionalStatus } = require('../utils/professionalStatus');

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true, lowercase: true, trim: true},
    username: {type: String, unique: true, required: true},
    passwordHash: {type: String, required: true},
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
        avatarUrl: {type: String},
        language: {type: String, default: "da"}
    },
},
{timestamps: true });

module.exports = mongoose.model("User", userSchema);
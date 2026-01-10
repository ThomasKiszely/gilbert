const mongoose = require('mongoose');
const { userRoles } = require('../utils/userRoles');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: userRoles, default: 'private', required: true },
    location: {
        city: { type: String, required: true },
        country: { type: String, required: true },
    },
    cvr: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    badges: {
        isProfessional: { type: Boolean, default: false },
        isExpertSeller: { type: Boolean, default: false },
        isIdVerified: { type: Boolean, default: false },
        isGilbertTeam: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false }
    },
    stats: {
        numberOfSales: { type: Number, default: 0 },
        ratingAverage: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 }
    },
    profile: {
        bio: { type: String },
        avatarUrl: { type: String },
        language: { type: String, default: "da" }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
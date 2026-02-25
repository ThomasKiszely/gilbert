const mongoose = require('mongoose');
const { reportStatusses } = require('../utils/reportStatusses');

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: Object.values(reportStatusses), required: true, default: reportStatusses.pending },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
const mongoose = require('mongoose');
const notificationTypes = require('../utils/notificationTypes');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(notificationTypes), required: true },
    data: { type: Object, default: {} },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
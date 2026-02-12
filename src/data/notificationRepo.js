const Notification = require('../models/Notification');

async function createNotification(userId, type, data = {}) {
    return await Notification.create({ userId, type, data });
}

async function getNotificationsForUser(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
}

async function markAsRead(notificationId){
    return await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        {new: true}
    );
}

module.exports = {
    createNotification,
    getNotificationsForUser,
    markAsRead,
}
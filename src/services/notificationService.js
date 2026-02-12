const notificationRepo = require('../data/notificationRepo');

async function notifyUser(userId, payload) {
    const { type, ...data } = payload;
    if (!type) {
        throw new Error("Notification type is required");
    }
    return await notificationRepo.createNotification(userId, type, data);
}

async function getUserNotifications(userId){
    return await notificationRepo.getNotificationsForUser(userId);
}

async function markNotificationAsRead(notificationId){
    return await notificationRepo.markAsRead(notificationId);
}

module.exports = {
    notifyUser,
    getUserNotifications,
    markNotificationAsRead
}
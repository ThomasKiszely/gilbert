const notificationRepo = require('../data/notificationRepo');


async function notifyUser(userId, payload) {
    console.log("DEBUG PAYLOAD MODTAGET I SERVICE:", payload); // <--- TILFØJ DENNE
    const { type, ...extraData } = payload;

    console.log("DEBUG EKSTRA DATA TIL REPO:", extraData);     // <--- TILFØJ DENNE

    if (!type) {
        throw new Error("Notification type is required");
    }
    return await notificationRepo.createNotification(userId, type, extraData);
}

async function getUserNotifications(userId){
    return await notificationRepo.getNotificationsForUser(userId);
}

async function markNotificationAsRead(notificationId){
    return await notificationRepo.markAsRead(notificationId);
}
async function getNotificationById(id){
    return await notificationRepo.getNotificationById(id);
}

module.exports = {
    notifyUser,
    getUserNotifications,
    markNotificationAsRead,
    getNotificationById,
}
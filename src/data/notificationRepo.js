const Notification = require('../models/Notification');

async function createNotification(userId, type, data = {}) {
    console.log("REPO: Gemmer notifikation for", userId, "Type:", type, "Data:", data);

    // VIGTIGT: Tjek om din model bruger 'userId' eller 'user'.
    // De fleste Mongoose-modeller bruger 'user'.
    return await Notification.create({
        userId, // Hvis din model har 'userId: { type: ObjectId }'
        type,
        data
    });
}

async function getNotificationsForUser(userId) {
    // Sørg for at vi kun henter notifikationer, der rent faktisk tilhører brugeren
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
}

async function markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );
}

async function getNotificationById(id) {
    return await Notification.findById(id);
}

module.exports = {
    createNotification,
    getNotificationsForUser,
    markAsRead,
    getNotificationById,
};
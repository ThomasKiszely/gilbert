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
    // Hent alle ulæste først
    const unread = await Notification.find({ userId, read: false }).sort({ createdAt: -1 });
    // Hent de seneste læste, så vi har max 20 i alt
    const readLimit = Math.max(0, 20 - unread.length);
    const read = readLimit > 0
        ? await Notification.find({ userId, read: true }).sort({ createdAt: -1 }).limit(readLimit)
        : [];
    // Kombiner ulæste og læste
    return [...unread, ...read];
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
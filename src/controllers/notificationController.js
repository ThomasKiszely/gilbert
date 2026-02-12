const notificationService = require('../services/notificationService');

async function getNotifications(req, res, next) {
    try{
        const notifications = await notificationService.getUserNotifications(req.user.id);
        return res.status(200).json({ success: true, notifications: notifications });
    } catch (error) {
        next(error);
    }
}

async function markAsRead(req, res, next) {
    try{
        const read = await notificationService.markNotificationAsRead(req.params.id);
        return res.status(200).json({ success: true, read });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getNotifications,
    markAsRead,
}
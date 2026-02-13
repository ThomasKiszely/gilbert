const ChatMessage = require('../models/ChatMessage');

async function createMessage(threadId, senderId, text) {
    return await ChatMessage.create({ threadId, senderId, text });
}

async function getMessages(threadId){
    return await ChatMessage.find({ threadId }).sort({ createdAt: 1 });
}

async function markThreadAsRead(threadId, userId){
    return await ChatMessage.updateMany(
        { threadId, senderId: { $ne: userId }},
    { read: true }
    );
}

module.exports = {
    createMessage,
    getMessages,
    markThreadAsRead,
}
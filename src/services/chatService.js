const chatThreadRepo = require('../data/chatThreadRepo');
const chatMessageRepo = require('../data/chatMessageRepo');
const productRepo = require('../data/productRepo');
const notificationService = require('../services/notificationService');
const notificationTypes = require('../utils/notificationTypes');


// chatService.js
async function sendMessage(id, senderId, text) {
    let thread;
    let productId;

    // Tjek om 'id' er en eksisterende tråd
    thread = await chatThreadRepo.findThreadById(id);

    if (thread) {
        // Hvis vi har en tråd, ved vi allerede hvem køber/sælger er
        productId = thread.productId;
    } else {
        // Hvis ikke, må 'id' være et productId (start af ny chat)
        productId = id;
        const product = await productRepo.getProductById(productId);
        if (!product) throw new Error("Product not found");

        const sellerId = product.seller;
        const buyerId = senderId;

        if (senderId === sellerId.toString()) {
            throw new Error("Seller cannot start a chat");
        }

        thread = await chatThreadRepo.findThread(productId, buyerId, sellerId);
        if (!thread) {
            thread = await chatThreadRepo.createThread(productId, buyerId, sellerId);
        }
    }

    // Identificer modtager (senderId vs køber/sælger i tråden)
    const receiverId = String(senderId) === String(thread.sellerId)
        ? thread.buyerId
        : thread.sellerId;

    const message = await chatMessageRepo.createMessage(thread._id, senderId, text);
    await chatThreadRepo.updateLastMessage(thread._id);

    await notificationService.notifyUser(receiverId, {
        type: notificationTypes.chat_message,
        threadId: thread._id,
        productId,
        preview: text.slice(0, 50)
    });

    return message;
}

async function getThreadMessages(threadId, userId){
    const messages = await chatMessageRepo.getMessages(threadId);
    await chatMessageRepo.markThreadAsRead(threadId, userId);
    return messages;
}

async function getUserThreads(userId){
    return await chatThreadRepo.getThreadsForUser(userId);
}

module.exports = {
    sendMessage,
    getThreadMessages,
    getUserThreads,
}
const chatThreadRepo = require('../data/chatThreadRepo');
const chatMessageRepo = require('../data/chatMessageRepo');
const productRepo = require('../data/productRepo');
const notificationService = require('../services/notificationService');
const notificationTypes = require('../utils/notificationTypes');

async function sendMessage(id, senderId, text) {
    let thread;
    let productId;

    // 1. Find eller opret tråd
    thread = await chatThreadRepo.findThreadById(id);

    if (thread) {
        productId = thread.productId;
    } else {
        productId = id;
        const product = await productRepo.getProductById(productId);
        if (!product) throw new Error("Product not found");

        const sellerId = product.seller;
        if (String(senderId) === String(sellerId)) {
            throw new Error("Seller cannot start a chat");
        }

        thread = await chatThreadRepo.findThread(productId, senderId, sellerId);
        if (!thread) {
            thread = await chatThreadRepo.createThread(productId, senderId, sellerId);
        }
    }

    // 2. Definer modtageren (vigtigt: tjek mod både sellerId og buyerId)
    // Vi tvinger alt til String for at undgå ObjectId sammenligningsfejl
    const sellerIdStr = String(thread.sellerId?._id || thread.sellerId);
    const buyerIdStr = String(thread.buyerId?._id || thread.buyerId);
    const senderIdStr = String(senderId);

    const receiverId = senderIdStr === sellerIdStr ? buyerIdStr : sellerIdStr;

    // 3. Gem selve beskeden i databasen
    const message = await chatMessageRepo.createMessage(thread._id, senderId, text);
    await chatThreadRepo.updateLastMessage(thread._id);

    // 4. LOGIK FOR NOTIFIKATION (HER SKAL DEN STOPPE DIG SELV)
    console.log("--- NOTIFICATION CHECK ---");
    console.log("Sender:", senderIdStr);
    console.log("Receiver:", receiverId);

    if (senderIdStr !== String(receiverId)) {
        console.log("SENDING NOTIFICATION TO MODPART...");
        await notificationService.notifyUser(receiverId, {
            type: notificationTypes.chat_message,
            // .toString() er nøglen her!
            threadId: thread._id.toString(),
            productId: productId.toString(),
            text: text.slice(0, 50)
        });
    } else {
        console.log("BLOCKING NOTIFICATION: You are the receiver of your own message!");
    }

    return message;
}

// Husk de andre funktioner i filen...
async function getThreadMessages(id, userId) {
    let thread;
    thread = await chatThreadRepo.findThreadById(id);

    if (!thread) {
        thread = await chatThreadRepo.findThreadByProductAndUser(id, userId);
    }

    if (!thread) {
        return [];
    }

    const messages = await chatMessageRepo.getMessages(thread._id);

    await chatMessageRepo.markThreadAsRead(thread._id, userId);

    return messages;
}

async function getUserThreads(userId) {
    return await chatThreadRepo.getThreadsForUser(userId);
}

async function findUserThreadById(id, userId) {
    let thread = await chatThreadRepo.findThreadById(id);

    if (!thread) {
        thread = await chatThreadRepo.findThreadByProductAndUser(id, userId);
    }

    return thread;
}

module.exports = {
    sendMessage,
    getThreadMessages,
    getUserThreads,
    findUserThreadById
};
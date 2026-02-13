const ChatThread = require('../models/chatThread');

async function findThread(productId, buyerId, sellerId, ){
    return await ChatThread.findOne({ productId, buyerId, sellerId });
}

async function createThread(productId, buyerId, sellerId){
    return await ChatThread.create({ productId, buyerId, sellerId });
}

async function updateLastMessage(threadId){
    return await ChatThread.findByIdAndUpdate(threadId, {lastMessageAt: new Date()});
}

async function getThreadsForUser(userId){
    return await ChatThread.find({
        $or: [{buyerId: userId}, {sellerId: userId}],
    }).sort({ lastMessageAt: -1 });
}
async function findThreadBySeller(productId, sellerId) {
    return await ChatThread.findOne({ productId, sellerId });
}
async function findThreadById(threadId){
    return await ChatThread.findById(threadId);
}

module.exports = {
    createThread,
    updateLastMessage,
    getThreadsForUser,
    findThread,
    findThreadBySeller,
    findThreadById,
}
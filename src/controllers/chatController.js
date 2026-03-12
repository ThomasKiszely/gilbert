const chatService = require("../services/chatService");
const { sanitizeUser } = require("../utils/sanitizeUser");

async function sendMessage(req, res, next) {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const message = await chatService.sendMessage(id, req.user.id, text);

        return res.status(201).json({ success: true, message });
    } catch (error) {
        console.error("FEJL I SENDMESSAGECTR: " + error.message);
        next(error);
    }
}

async function getMessages(req, res, next) {
    try {
        const { threadId } = req.params;
        const messages = await chatService.getThreadMessages(threadId, req.user.id);

        const safeMessages = messages.map(m => {
            const obj = m.toObject ? m.toObject() : m;
            return {
                ...obj,
                sender: sanitizeUser(obj.sender)
            };
        });

        return res.status(200).json({
            success: true,
            message: safeMessages
        });
    } catch (error) {
        next(error);
    }
}

async function getThreads(req, res, next) {
    try {
        const threads = await chatService.getUserThreads(req.user.id);

        const safeThreads = threads.map(t => {
            const obj = t.toObject ? t.toObject() : t;
            return {
                ...obj,
                seller: sanitizeUser(obj.seller),
                buyer: sanitizeUser(obj.buyer)
            };
        });

        return res.status(200).json({ success: true, message: safeThreads });
    } catch (error) {
        next(error);
    }
}

async function getThreadById(req, res, next) {
    try {
        const { threadId } = req.params;
        const thread = await chatService.findUserThreadById(threadId, req.user.id);

        const obj = thread.toObject ? thread.toObject() : thread;

        const safeThread = {
            ...obj,
            seller: sanitizeUser(obj.seller),
            buyer: sanitizeUser(obj.buyer)
        };

        return res.status(200).json({ success: true, message: safeThread });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    sendMessage,
    getMessages,
    getThreads,
    getThreadById,
};

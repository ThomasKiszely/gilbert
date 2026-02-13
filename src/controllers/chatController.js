const chatService = require("../services/chatService");


async function sendMessage(req, res, next) {
    try {
        const { productId } = req.params;
        const { text } = req.body;
        const message = await chatService.sendMessage(productId, req.user.id, text);
        return res.status(201).json({ success: true, message });
    } catch (error) {
        console.error("FEJL I SENDMESSAGECTR: " + error.message);
        next(error);
    }
}

async function getMessages(req, res, next) {
    try{
        const { threadId } = req.params;
        const messages = await chatService.getThreadMessages(threadId, req.user.id);
        console.log("GETTING MESSAGES: " + messages);
        return res.status(200).json({
            success: true,
            message: Array.isArray(messages) ? messages : [messages]
        });
    } catch (error){
        next(error);
    }
}

async function getThreads(req, res, next) {
    try{
        const threads = await chatService.getUserThreads(req.user.id);
        return res.status(200).json({ success: true, message: threads });
    } catch (error){
        next(error);
    }
}

module.exports = {
    sendMessage,
    getMessages,
    getThreads,
}
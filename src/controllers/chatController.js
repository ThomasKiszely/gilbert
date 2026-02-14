const chatService = require("../services/chatService");


async function sendMessage(req, res, next) {
    try {
        // Vi kalder den bare 'id' – det kan være et threadId ELLER et productId
        const { id } = req.params;
        const { text } = req.body;

        // Din service håndterer allerede 'id' logikken internt
        const message = await chatService.sendMessage(id, req.user.id, text);

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

async function getThreadById(req, res, next) {
    try{
        const { threadId } = req.params;
        const thread = await chatService.findUserThreadById(threadId);
        return res.status(200).json({ success: true, message: thread });
    } catch (error){
        next(error);
    }
}

module.exports = {
    sendMessage,
    getMessages,
    getThreads,
    getThreadById,
}
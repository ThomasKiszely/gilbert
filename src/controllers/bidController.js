const bidService = require('../services/bidService');
const chatService = require('../services/chatService');

async function placeBid(req, res, next) {
    try {
        const { productId } = req.params;
        const { amount } = req.body;
        const buyerId = req.user.id;
        const bid = await bidService.placeBid(productId, buyerId, amount);
        res.status(201).json({ success: true, data: bid });
    } catch (error) {
        next(error);
    }
}

async function rejectBid(req, res, next) {
    try{
        const { bidId } = req.params;
        const sellerId = req.user.id;

        const rejected = await bidService.rejectBid(bidId, sellerId);
        res.status(204).end();
    } catch (error){
        next (error);
    }
}

async function acceptBid(req, res, next) {
    try{
        const { bidId } = req.params;
        const sellerId = req.user.id;
        const bid = await bidService.acceptBid(bidId, sellerId);
        res.status(200).json({ success: true, data: bid });
    } catch (error) {
        next(error);
    }
}

async function counterBid(req, res, next) {
    try{
        const { bidId } = req.params;
        const { counterAmount } = req.body;
        const sellerId = req.user.id;
        const bid = await bidService.counterBid(bidId, sellerId, counterAmount);
        res.status(200).json({ success: true, data: bid });
    } catch (error) {
        next(error);
    }
}

async function acceptCounterBid(req, res, next) {
    try{
        const { bidId } = req.params;
        const buyerId = req.user.id;
        const bid = await bidService.acceptCounterBid(bidId, buyerId);
        res.status(200).json({ success: true, data: bid });
    } catch (error) {
        next(error);
    }
}

async function rejectCounterBid(req, res, next) {
    try{
        const { bidId } = req.params;
        const buyerId = req.user.id;
        await bidService.rejectCounterBid(bidId, buyerId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
}

async function getActiveBidForThread(req, res, next) {
    try {
        const { threadId } = req.params;
        const thread = await chatService.findUserThreadById(threadId);
        if(!thread){
            return res.status(404).json({ success: false, message: 'Thread Not Found' });
        }
        const bid = await bidService.findCurrentBidWorkflow(
            thread.productId._id,
            thread.buyerId._id
        );

        // Ret 'data' til 'bid', så det matcher ChatPage: if (data.bid)
        return res.status(200).json({ success: true, bid: bid });

    } catch (error){
        next(error);
    }
}

/*
async function expireBid(req, res, next) {
    try{
        const { bidId } = req.params;
        const bid = await bidService.expireBid(bidId)
        res.status(200).json({ success: true, data: bid });
    } catch (error) {
        next(error);
    }
}
 */

module.exports = {
    acceptBid,
    counterBid,
    rejectBid,
    placeBid,
    acceptCounterBid,
    rejectCounterBid,
    getActiveBidForThread,
    //expireBid
}
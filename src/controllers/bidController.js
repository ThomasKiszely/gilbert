const bidService = require('../services/bidService');

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
    //expireBid
}
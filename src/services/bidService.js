const productRepo = require(`../data/productRepo`);
const bidRepo = require(`../data/bidRepo`);
const bidStatusses = require(`../utils/bidStatusses`);
const notificationTypes = require(`../utils/notificationTypes`);
const notificationService = require('../services/notificationService');
const chatService = require('../services/chatService');


async function placeBid(productId, buyerId, amount){
    const product = await productRepo.getProductById(productId);
    if (!product) {
        throw new Error(`Product not found`);
    }
    const minBid = product.price * 0.7;
    if (amount < minBid){
        throw new Error(`Bid must be minimum ${minBid}.`);
    }

    const existing = await bidRepo.findActiveBidsByProductAndBuyer(productId, buyerId);
    if (existing) {
        throw new Error('You already have an active bid on this product');
    }


    const bid = await bidRepo.createBid({
        productId: productId,
        buyerId: buyerId,
        sellerId: product.seller,
        amount: amount,
        status: bidStatusses.active
    });

    try {
        const systemText = `SYSTEM_BID: I placed a bid of ${amount} DKK.`;
        // Vi bruger chatService til at finde/oprette tråden og gemme beskeden
        await chatService.sendMessage(productId, buyerId, systemText);
    } catch (chatError) {
        console.error("Could not make system message:", chatError);
        // Vi fejler ikke selve buddet, selvom chat-beskeden driller
    }

   await notificationService.notifyUser(bid.seller, {
        type: notificationTypes.new_bid,
        bidId: bid._id,
        productId: bid.productId,
    });
    return bid;
}

async function rejectBid(bidId, sellerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid) {
        throw new Error(`Bid not found`);
    }
    if(bid.sellerId.toString() !== sellerId){
        throw new Error(`You are not allowed to reject this bid`);
    }
    if ( bid.status !== bidStatusses.active && bid.status !==bidStatusses.countered){
        throw new Error(`Bid cannot be rejected at the moment`);
    }
    if (bid.expiresAt < new Date()) {
        throw new Error("Bid has expired");
    }

    const rejected = await bidRepo.updateBidStatus(bidId, bidStatusses.rejected, sellerId, "Seller rejected bid");

    await notificationService.notifyUser(bid.buyerId, {
        type: notificationTypes.bid_rejected,
        bidId: bid._id,
        productId: bid.productId,
    });
    return rejected;

}

async function acceptBid(bidId, sellerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid) {
        throw new Error(`Bid not found`);
    }
    if(bid.sellerId.toString() !== sellerId){
        throw new Error(`You are not allowed to accept this bid`);
    }
    if (bid.status !== bidStatusses.active){
        throw new Error(`This bid is not active any longer`);
    }
    if (bid.expiresAt < new Date()) {
        throw new Error("Bid has expired");
    }

    const updated = await bidRepo.updateBidStatus(
        bidId,
        bidStatusses.accepted,
        sellerId,
        "Seller accepted bid"
    );
    await notificationService.notifyUser(bid.buyerId, {
        type: notificationTypes.bid_accepted,
        bidId: bid._id,
        productId: bid.productId,
    });

    //reserver pris i checkout

    return updated;
}

async function counterBid(bidId, sellerId, counterAmount){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid) {
        throw new Error(`Bid not found`);
    }
    if(bid.sellerId.toString() !== sellerId){
        throw new Error(`You are not allowed to counter this bid`);
    }
    if (bid.status !== bidStatusses.active){
        throw new Error(`This bid is not active any longer`);
    }
    if (bid.expiresAt < new Date()) {
        throw new Error("Bid has expired");
    }
    await notificationService.notifyUser(bid.buyerId, {
        type: notificationTypes.counter_bid,
        bidId: bid._id,
        productId: bid.productId,
    });

    return await bidRepo.updateBidWithCounter(
        bidId,
        counterAmount,
        sellerId,
        "Seller countered bid"
    );
}

async function acceptCounterBid(bidId, buyerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid) {
        throw new Error(`Bid not found`);
    }
    if(bid.buyerId.toString() !== buyerId){
        throw new Error(`You are not allowed to accept this bid`);
    }
    if (bid.status !== bidStatusses.countered){
        throw new Error(`Bid is not in countered state`);
    }
    if (bid.expiresAt < new Date()) {
        throw new Error("Bid has expired");
    }

    await notificationService.notifyUser(bid.sellerId, {
        type: notificationTypes.bid_accepted,
        bidId: bid._id,
        productId: bid.productId,
    });

    return await bidRepo.updateBidStatus(
        bidId,
        bidStatusses.accepted,
        buyerId,
        "Buyer accepted counterbid"
    );
}

async function rejectCounterBid(bidId, buyerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid) {
        throw new Error(`Bid not found`);
    }
    if(bid.buyerId.toString() !== buyerId){
        throw new Error(`You are not allowed to reject this bid`);
    }
    if (bid.status !== bidStatusses.countered){
        throw new Error(`Bid is not in countered state`);
    }
    if (bid.expiresAt < new Date()) {
        throw new Error("Bid has expired");
    }
    await notificationService.notifyUser(bid.sellerId, {
        type: notificationTypes.bid_rejected,
        bidId: bid._id,
        productId: bid.productId,
    });

    return await bidRepo.updateBidStatus(
        bidId,
        bidStatusses.rejected,
        buyerId,
        "buyer rejected counterbid"
    )
}

async function findCurrentBidWorkflow(productId, buyerId){
    return await bidRepo.findCurrentBidWorkflow(productId, buyerId);
}

/*
async function expireBid(bidId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid) {
        throw new Error(`Bid not found`);
    }
    if (bid.status !== bidStatusses.active && bid.status !==bidStatusses.countered){
        throw new Error(`Only active bids can be expired`);
    }
    return await bidRepo.updateBidStatus(
        bidId,
        bidStatusses.expired,
        null,
        "Expired bid"
    )
}

 */
module.exports = {
    placeBid,
    rejectBid,
    acceptBid,
    rejectCounterBid,
    //expireBid,
    acceptCounterBid,
    counterBid,
    findCurrentBidWorkflow
}
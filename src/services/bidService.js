const productRepo = require(`../data/productRepo`);
const bidRepo = require(`../data/bidRepo`);
const bidStatusses = require(`../utils/bidStatusses`);
const notificationTypes = require(`../utils/notificationTypes`);
const notificationService = require('../services/notificationService');
const chatService = require('../services/chatService');


async function placeBid(productId, buyerId, amount){
    const product = await productRepo.getProductById(productId);
    if (!product) throw new Error(`Product not found`);

    const minBid = product.price * 0.7;
    if (amount < minBid) throw new Error(`Bid must be minimum ${minBid}.`);

    const existing = await bidRepo.findActiveBidsByProductAndBuyer(productId, buyerId);
    if (existing) throw new Error('You already have an active bid on this product');

    const bid = await bidRepo.createBid({
        productId: productId,
        buyerId: buyerId,
        sellerId: product.seller,
        amount: amount,
        status: bidStatusses.active
    });

    try {
        await chatService.sendMessage(productId, buyerId, `SYSTEM_BID: I placed a bid of ${amount} DKK.`);
    } catch (e) { console.error("Chat error:", e); }

    try {
        await notificationService.notifyUser(bid.seller, {
            type: notificationTypes.new_bid,
            bidId: bid._id,
            productId: bid.productId,
        });
    } catch (e) { console.error("Notif error:", e); }

    return bid;
}

async function counterBid(bidId, sellerId, counterAmount){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid) throw new Error(`Bid not found`);
    if(bid.sellerId.toString() !== sellerId) throw new Error(`Unauthorized`);

    const updated = await bidRepo.updateBidWithCounter(bidId, counterAmount, sellerId, "Seller countered bid");

    try {
        await chatService.sendMessage(bid.productId, bid.buyerId, `SYSTEM_BID: I countered with ${counterAmount} DKK.`);
    } catch (e) { console.error("Chat error:", e); }

    try {
        await notificationService.notifyUser(bid.buyerId, {
            type: notificationTypes.counter_bid,
            bidId: bid._id,
            productId: bid.productId,
        });
    } catch (e) { console.error("Notif error:", e); }

    return updated;
}

async function acceptBid(bidId, sellerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid || bid.sellerId.toString() !== sellerId) throw new Error(`Unauthorized or not found`);

    const updated = await bidRepo.updateBidStatus(bidId, bidStatusses.accepted, sellerId, "Seller accepted bid");

    // Auto-reject all other bids
    await bidRepo.rejectAllActiveBids(bid.productId, bidId);

    // Notify other buyers
    const otherBids = await bidRepo.findActiveBidsByProduct(bid.productId, bidId);

    for (const other of otherBids) {
        try {
            await notificationService.notifyUser(other.buyerId, {
                type: notificationTypes.bid_rejected,
                bidId: other._id,
                productId: other.productId
            });

            await chatService.sendMessage(
                other.productId,
                other.buyerId,
                `SYSTEM_BID: Your bid was automatically rejected because another bid was accepted.`
            );
        } catch (e) {
            console.error("Auto-reject notif/chat error:", e);
        }
    }

    // Notify accepted buyer
    try {
        await chatService.sendMessage(bid.productId, bid.buyerId, `SYSTEM_BID: Bid accepted!`);
        await notificationService.notifyUser(bid.buyerId, {
            type: notificationTypes.bid_accepted,
            bidId: bid._id,
            productId: bid.productId,
        });
    } catch (e) { console.error("Notif error:", e); }

    return updated;
}


async function rejectBid(bidId, sellerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid || bid.sellerId.toString() !== sellerId) throw new Error(`Unauthorized or not found`);

    const rejected = await bidRepo.updateBidStatus(bidId, bidStatusses.rejected, sellerId, "Seller rejected bid");

    try {
        await chatService.sendMessage(bid.productId, bid.buyerId, `SYSTEM_BID: Bid declined.`);
    } catch (e) { console.error("Chat error:", e); }

    try {
        await notificationService.notifyUser(bid.buyerId, {
            type: notificationTypes.bid_rejected,
            bidId: bid._id,
            productId: bid.productId,
        });
    } catch (e) { console.error("Notif error:", e); }

    return rejected;
}

async function acceptCounterBid(bidId, buyerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid || bid.buyerId.toString() !== buyerId) throw new Error(`Unauthorized or not found`);

    const updated = await bidRepo.updateBidStatus(bidId, bidStatusses.accepted, buyerId, "Buyer accepted counterbid");

    // Auto-reject all other bids on the same product
    await bidRepo.rejectAllActiveBids(bid.productId, bidId);

    // Notify other buyers
    const otherBids = await bidRepo.findActiveBidsByProduct(bid.productId, bidId);

    for (const other of otherBids) {
        try {
            await notificationService.notifyUser(other.buyerId, {
                type: notificationTypes.bid_rejected,
                bidId: other._id,
                productId: other.productId
            });

            await chatService.sendMessage(
                other.productId,
                other.buyerId,
                `SYSTEM_BID: Your bid was automatically rejected because another bid was accepted.`
            );
        } catch (e) {
            console.error("Auto-reject notif/chat error:", e);
        }
    }

    // Notify seller
    try {
        await chatService.sendMessage(bid.productId, buyerId, `SYSTEM_BID: Counter offer accepted!`);
        await notificationService.notifyUser(bid.sellerId, {
            type: notificationTypes.bid_accepted,
            bidId: bid._id,
            productId: bid.productId,
        });
    } catch (e) { console.error("Notif error:", e); }

    return updated;
}


async function rejectCounterBid(bidId, buyerId){
    const bid = await bidRepo.getBidById(bidId);
    if (!bid || bid.buyerId.toString() !== buyerId) throw new Error(`Unauthorized or not found`);

    const rejected = await bidRepo.updateBidStatus(bidId, bidStatusses.rejected, buyerId, "Buyer rejected counterbid");

    try {
        await chatService.sendMessage(bid.productId, buyerId, `SYSTEM_BID: Counter offer declined.`);
    } catch (e) { console.error("Chat error:", e); }

    try {
        await notificationService.notifyUser(bid.sellerId, {
            type: notificationTypes.bid_rejected,
            bidId: bid._id,
            productId: bid.productId,
        });
    } catch (e) { console.error("Notif error:", e); }

    return rejected;
}

async function findCurrentBidWorkflow(productId, buyerId){
    return await bidRepo.findCurrentBidWorkflow(productId, buyerId);
}
async function getBidsByUser(userId){
    return await bidRepo.getBidsByUser(userId);
}
async function expireOldBids() {
    const now = new Date();
    const expiredBids = await bidRepo.findExpiredBids(now);

    for (const bid of expiredBids) {

        // Opdater status
        await bidRepo.updateBidStatus(
            bid._id,
            bidStatusses.expired,
            null,
            "Bid expired automatically after 24 hours"
        );

        // Notifikationer
        try {
            await notificationService.notifyUser(bid.buyerId, {
                type: notificationTypes.bid_expired,
                bidId: bid._id,
                productId: bid.productId
            });

            await notificationService.notifyUser(bid.sellerId, {
                type: notificationTypes.bid_expired,
                bidId: bid._id,
                productId: bid.productId
            });
        } catch (e) {
            console.error("Notif error:", e);
        }

        // Chat besked (valgfrit)
        try {
            await chatService.sendMessage(
                bid.productId,
                bid.buyerId,
                `SYSTEM_BID: This bid expired after 24 hours.`
            );
        } catch (e) {
            console.error("Chat error:", e);
        }
    }
}

async function deleteOldBids() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await bidRepo.deleteOldBids(cutoff);
    console.log(`🗑️ Auto-delete: ${result.deletedCount} bids older than 30 days removed.`);
}


module.exports = {
    placeBid,
    rejectBid,
    acceptBid,
    rejectCounterBid,
    acceptCounterBid,
    counterBid,
    findCurrentBidWorkflow,
    getBidsByUser,
    expireOldBids,
    deleteOldBids
}
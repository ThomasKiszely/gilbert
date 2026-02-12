const productRepo = require(`../data/productRepo`);
const bidRepo = require(`../data/bidRepo`);
const bidStatusses = require(`../utils/bidStatusses`);
//const notificationService = require('../services/notificationService');


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
    //Skal lave notificationsservice
   /* await notificationService.notifyUser(product.seller, {
        type: "new_bid",
        bidId: bid._id,
        productId: productId,
    });*/
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
    const rejected = await bidRepo.updateBidStatus(bidId, bidStatusses.rejected, sellerId, "Seller rejected bid");
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
    const updated = await bidRepo.updateBidStatus(
        bidId,
        bidStatusses.accepted,
        sellerId,
        "Seller accepted bid"
    );

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
    return await bidRepo.updateBidStatus(
        bidId,
        bidStatusses.rejected,
        buyerId,
        "buyer rejected counterbid"
    )
}

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

module.exports = {
    placeBid,
    rejectBid,
    acceptBid,
    rejectCounterBid,
    expireBid,
    acceptCounterBid,
    counterBid
}
const Bid = require('../models/bid');
const bidStatusses = require('../utils/bidStatusses');

async function createBid(data){
    const bid = new Bid(data);
    return await bid.save();
}

async function getBidById(bidId){
    return await Bid.findById(bidId);
}

async function updateBidStatus(bidId, status, actorId, details = "") {
    return await Bid.findByIdAndUpdate(
        bidId,
        {
            status,
            $push: {
                history: {
                    action: status,
                    timestamp: new Date(),
                    actorId,
                    details
                }
            }
        },{ new: true, runValidators: true }
    );
}

async function updateBidWithCounter(bidId, counterAmount, actorId, details = "") {
    return await Bid.findByIdAndUpdate(
        bidId,
        {
            status: bidStatusses.countered,
            counterAmount: counterAmount,
            $push: {
                history: {
                    action: bidStatusses.countered,
                    timestamp: new Date(),
                    actorId,
                    details
                }
            }
        }, { new: true, runValidators: true }
    );
}

async function findActiveBidsByProductAndBuyer(productId, buyerId){
    const activeBids = await Bid.findOne({ productId, buyerId, status: bidStatusses.active });
    return activeBids;
}

async function findCurrentBidWorkflow(productId, buyerId) {
    // Vi leder efter det nyeste bud, der stadig er i proces
    return await Bid.findOne({
        productId: productId,
        buyerId: buyerId,
        status: { $in: [bidStatusses.active, bidStatusses.countered] }
    }).sort({ createdAt: -1 }); // Tag altid det seneste
}

async function rejectAllActiveBids(productId, excludeBidId) {
    return await Bid.updateMany(
        {
            productId,
            _id: { $ne: excludeBidId },
            status: { $in: [bidStatusses.active, bidStatusses.countered] }
        },
        {
            status: bidStatusses.rejected,
            $push: {
                history: {
                    action: bidStatusses.rejected,
                    timestamp: new Date(),
                    actorId: null,
                    details: "Bid auto-rejected because another bid was accepted"
                }
            }
        }
    );
}

async function getBidsByUser(userId) {
    return await Bid.find({
        $or: [
            { buyerId: userId },
            { sellerId: userId }
        ],
        // Vi henter kun aktive eller modbudte bud til denne oversigt
        status: { $in: [bidStatusses.active, bidStatusses.countered] }
    })
        .populate('productId', 'title images price') // Hent kun nødvendig info fra produktet
        .sort({ updatedAt: -1 }); // Nyeste øverst
}

async function findExpiredBids(now) {
    return await Bid.find({
        status: { $in: [bidStatusses.active, bidStatusses.countered] },
        expiresAt: { $lt: now }
    });
}

async function findActiveBidsByProduct(productId, excludeBidId) {
    return await Bid.find({
        productId,
        _id: { $ne: excludeBidId },
        status: { $in: [bidStatusses.active, bidStatusses.countered] }
    });
}
async function deleteOldBids(cutoffDate) {
    return await Bid.deleteMany({
        createdAt: { $lt: cutoffDate }
    });
}

module.exports = {
    createBid,
    updateBidStatus,
    findActiveBidsByProductAndBuyer,
    rejectAllActiveBids,
    findActiveBidsByProduct,
    getBidById,
    updateBidWithCounter,
    findCurrentBidWorkflow,
    getBidsByUser,
    findExpiredBids,
    deleteOldBids,
}
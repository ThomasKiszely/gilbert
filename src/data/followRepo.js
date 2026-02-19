const Follows = require('../models/Follows');

async  function addFollow(followerId, followingId) {
    return Follows.findOneAndUpdate(
        { followerId, followingId},
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
    )
}

async function removeFollow(followerId, followingId) {
    return Follows.deleteOne({followerId, followingId});
}

async function isFollowing(followerId, followingId) {
    return Follows.exists({followerId, followingId});
}

async function getFollowers(userId) {
    return Follows.find({followingId: userId}).populate("followerId");
}

async function getFollowing(userId) {
    return Follows.find({followerId: userId}).populate("followingId");
}

module.exports = {
    addFollow,
    removeFollow,
    isFollowing,
    getFollowers,
    getFollowing
}
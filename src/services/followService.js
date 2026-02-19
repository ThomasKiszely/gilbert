const followRepo = require("../data/followRepo");


async function addFollow(followerId, followingId) {
    return followRepo.addFollow(followerId, followingId);
}

async function removeFollow(followerId, followingId) {
    return followRepo.removeFollow(followerId, followingId);
}

async function isFollowing(followerId, followingId) {
    return followRepo.isFollowing(followerId, followingId);
}

async function getFollowers(userId) {
    return followRepo.getFollowers(userId);
}

async function getFollowing(userId) {
    return followRepo.getFollowing(userId);
}

module.exports = {
    addFollow,
    removeFollow,
    isFollowing,
    getFollowers,
    getFollowing,
}
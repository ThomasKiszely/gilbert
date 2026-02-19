const followService = require("../services/followService");



async function followUser(req, res, next)  {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        if(followerId === followingId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }
        await followService.addFollow(followerId, followingId);

        return res.status(200).json({ success: true, message: "User followed" });
    } catch (error) {
        next(error);
    }
}

async function unfollowUser(req, res, next)  {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        await followService.removeFollow(followerId, followingId);

        return res.status(200).json({ success: true, message: "User unfollowed" });
    } catch (error) {
        next(error);
    }
}

async function getFollowers(req, res, next)  {
    try {
        const userId = req.params.id;
        const followers = await followService.getFollowers(userId);

        return res.status(200).json({ success: true, data: followers });
    } catch (error) {
        next(error);
    }
}

async function getFollowing(req, res, next)  {
    try {
        const userId = req.params.id;
        const following = await followService.getFollowing(userId);

        return res.status(200).json({ success: true, data: following });
    } catch (error) {
        next(error);
    }
}

async function isFollowing(req, res, next)  {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        const result = await followService.isFollowing(followerId, followingId);

        return res.status(200).json({ success: true, isFollowing: !!result });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
}
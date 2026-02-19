const router = require("express").Router();
const followController = require("../controllers/followController");
const {requireAuth} = require("../middlewares/auth");

router.post("/:id", requireAuth , followController.followUser);

router.delete("/:id", requireAuth, followController.unfollowUser);

router.get("/:id/followers", followController.getFollowers);

router.get("/:id/following", followController.getFollowing);

router.get("/:id/is-following", requireAuth , followController.isFollowing);

module.exports = router;

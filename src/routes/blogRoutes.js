const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { requireAuth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/requireRole");

router.get('/front', blogController.getFrontPost);
router.get('/', blogController.listPublicPosts);
router.get('/:slug', blogController.getPostBySlug);

router.use(requireAuth);
router.use(requireRole("admin"));

router.post('/', blogController.createPost);
router.put('/:id', blogController.updatePost);
router.delete('/:id', blogController.deletePost);

module.exports = router;

const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { requireAuth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/requireRole");
const blogUpload = require('../middlewares/blogUpload');

router.get('/front', blogController.getFrontPost);
router.get('/', blogController.listPublicPosts);
router.get('/:slug', blogController.getPostBySlug);

router.use(requireAuth);
router.use(requireRole("admin"));


router.get('/admin/id/:id', blogController.getPostById);
router.post('/', blogUpload.single("image"), blogController.createPost);
router.put('/:id', blogUpload.single("image"), blogController.updatePost);
router.delete('/:id', blogController.deletePost);

module.exports = router;

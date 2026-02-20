const blogService = require('../services/blogService');
const {saveBlogImage} = require('../services/imageService');

async function getFrontPost(req, res, next){
    try{
        const data = await blogService.getFrontPost();
        return res.status(200).json({ success: true, data: data });
    } catch(error){
        next(error);
    }
}

async function getPostBySlug(req, res, next){
    try{
        const slug = req.params.slug;
        const post = await blogService.getPostBySlug(slug);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        return res.status(200).json({ success: true, data: post });
    } catch(error){
        next(error);
    }
}
async function listPublicPosts(req, res, next){
    try{
        const skip = Number(req.query.skip) || 0;
        const limit = Number(req.query.limit) || 20;
        const posts = await blogService.listPublicPosts(skip, limit);
        return res.status(200).json({ success: true, data: posts });
    } catch(error){
        next(error);
    }
}

async function createPost(req, res, next){
    try{
        const authorId = req.user?.id;

        const title = req.body.title;
        const content = req.body.content;

        if(!req.file){
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const blogUrl = await saveBlogImage(req.file);

        const postData = {
            title: title,
            content: content,
            image: blogUrl,
        }

        const created = await blogService.createPost(postData, authorId);
        return res.status(201).json({ success: true, data: created });
    } catch(error){
        console.error("Fejl i createPost controller:", error);
        next(error);
    }
}

async function updatePost(req, res, next){
    try{
        const id = req.params.id;

        const postData = { ...req.body };

        if (postData.isActive === 'true') postData.isActive = true;
        if (postData.isActive === 'false') postData.isActive = false;

        if (req.file) {
            postData.image = await saveBlogImage(req.file);
        }

        const updated = await blogService.updatePost(id, postData);
        return res.status(200).json({ success: true, data: updated });
    } catch(error){
        next(error);
    }
}

async function deletePost(req, res, next){
    try{
        const id = req.params.id;
        await blogService.removePost(id);
        return res.status(204).end();
    } catch(error){
        next(error);
    }
}

async function getPostById(req, res, next) {
    try {
        const id = req.params.id;
        const post = await blogService.getPostById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found by ID" });
        }

        return res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getFrontPost,
    getPostBySlug,
    listPublicPosts,
    createPost,
    updatePost,
    deletePost,
    getPostById,
}
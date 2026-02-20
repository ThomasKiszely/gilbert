const blogService = require('../services/blogService');


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

        const postData = {
            title: title,
            content: content,
            image: req.file ? `/api/images/blogs/${req.file.filename}` : null
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
        const { title, content } = req.body;
        const postData = {
            title,
            content
        };

        if (req.file) {
            postData.image = `/api/images/blogs/${req.file.filename}`;
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
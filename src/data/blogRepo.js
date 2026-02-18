const BlogPost = require("../models/BlogPost");

async function createBlogPost(data) {
    return await BlogPost.create(data);
}

async function updateBlogPost(id, data) {
    return await BlogPost.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

async function deleteBlogPost(id) {
    return await BlogPost.findByIdAndDelete(id);
}

async function getBlogPostBySlug(slug) {
    return await BlogPost.findOne({ slug });
}

async function getBlogPostById(id) {
    return await BlogPost.findById(id);
}


async function getLatestBlogPost(limit = 1) {
    return await BlogPost.find({})
        .sort({ publishedAt: -1 })
        .limit(limit);
}

async function listBlogPosts(skip = 0, limit = 20) {
    return await BlogPost.find({})
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);
}

module.exports = {
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getBlogPostBySlug,
    getBlogPostById,
    listBlogPosts,
    getLatestBlogPost,
}
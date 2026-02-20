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
    return await BlogPost.findOne({ slug }).populate('relatedProducts');
}

async function getBlogPostById(id) {
    return await BlogPost.findById(id).populate('relatedProducts');
}


async function getLatestBlogPost(limit = 1) {
    return await BlogPost.find({})
        .sort({ publishedAt: -1 })
        .limit(limit)
        .populate('relatedProducts');
}

async function listBlogPosts(skip = 0, limit = 20) {
    return await BlogPost.find({})
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);
}

async function updateMany(filter, update){
    return await BlogPost.updateMany(filter, update);
}

async function getActiveFrontPost() {
    return await BlogPost.findOne({ isActive: true }).populate('relatedProducts');
}

module.exports = {
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getBlogPostBySlug,
    getBlogPostById,
    listBlogPosts,
    getLatestBlogPost,
    updateMany,
    getActiveFrontPost,
}
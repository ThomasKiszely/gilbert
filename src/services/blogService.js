const blogRepo = require('../data/blogRepo');
const imageService = require('../services/imageService');

const { sanitizeString, sanitizeHtmlContent } = require('../utils/sanitize');
const { slugify } = require('../utils/slugify');

async function createPost(data, authorId){
    if (!data.title || !data.content){
        throw new Error('Title and content are required');
    }
    const title = sanitizeString(data.title);
    const slug = data.slug ? slugify(data.slug) : slugify(title);
    const content = sanitizeHtmlContent(data.content);

    const payload = {
        title,
        slug,
        content,
        image: data.image || null,
        authorId: authorId || null,
        publishedAt: data.publishedAt || Date.now(),
    };
    return await blogRepo.createBlogPost(payload);
}

async function updatePost(id, data){
    if (data.isActive === true){
        await blogRepo.updateMany({}, { isActive: false });
    }
    if (data.image) {
        const oldPost = await blogRepo.getBlogPostById(id);
        if (oldPost && oldPost.image && oldPost.image !== data.image){
            await imageService.deleteImage(oldPost.image);
        }
    }
    if(typeof data.relatedProducts === 'string'){
        try{
            data.relatedProducts = JSON.parse(data.relatedProducts);
        } catch(err){
            data.relatedProducts = data.relatedProducts.split(',').filter(id => id.trim());
        }
    }
    if (data.title){
        data.title = sanitizeString(data.title);
    }
    if (data.slug){
        data.slug = slugify(data.slug);
    }
    if(data.content){
        data.content = sanitizeHtmlContent(data.content);
    }
    return await blogRepo.updateBlogPost(id, data);
}

async function removePost(id){
    const blogPost = await blogRepo.getBlogPostById(id);
    if (!blogPost) {
        throw new Error('Blog post not found');
    }
    const picture = blogPost.image;
    if(picture){
        await imageService.deleteImage(picture);
    }
    return await blogRepo.deleteBlogPost(id);
}

async function getPostBySlug(slug){
    const post = await blogRepo.getBlogPostBySlug(slug);
    if(!post){
        return null;
    }
    post.content = sanitizeHtmlContent(post.content);
    return post;
}

async function getFrontPost(){
    // 1. Forsøg at finde det indlæg admin har sat som 'isActive'
    let post = await blogRepo.getActiveFrontPost();

    // 2. Hvis intet er markeret som aktivt, tag det nyeste som fallback
    if(!post) {
        const posts = await blogRepo.getLatestBlogPost(1);
        post = posts.length > 0 ? posts[0] : null;
    }

    if(!post){
        return { post: null, teaser: "" };
    }

    const postObj = post.toObject ? post.toObject() : post;
    const rawContent = postObj.content || "";
    const teaser = sanitizeHtmlContent(rawContent.slice(0, 300));

    return {
        post: postObj,
        teaser: teaser
    };
}

async function listPublicPosts(skip = 0, limit = 20){
    const posts = await blogRepo.listBlogPosts(skip, limit);

    return posts.map(p => {
        const postObj = p.toObject ? p.toObject() : p;
        const rawContent = postObj.content || "";

        return {
            ...postObj,
            teaser: sanitizeHtmlContent(rawContent.slice(0, 300)),
        };
    });
}
async function getPostById(id) {
    const post = await blogRepo.getBlogPostById(id);
    return post;
}


module.exports = {
    createPost,
    updatePost,
    removePost,
    listPublicPosts,
    getPostBySlug,
    getFrontPost,
    getPostById,
}
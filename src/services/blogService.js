const blogRepo = require('../data/blogRepo');

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
    const posts = await blogRepo.getLatestBlogPost(1);
    if(!posts || posts.length === 0){
        return { post: null };
    }
    const post = posts[0];
    const teaser = sanitizeHtmlContent(post.content.slice(0, 300));

    return { post: { ...post, teaser } };
}

async function listPublicPosts(skip = 0, limit = 20){
    const posts = await blogRepo.listBlogPosts(skip, limit);
    return posts.map(p => ({
        ...p,
        teaser: sanitizeHtmlContent(p.content.slice(0, 300)),
    }));
}

module.exports = {
    createPost,
    updatePost,
    removePost,
    listPublicPosts,
    getPostBySlug,
    getFrontPost,
}
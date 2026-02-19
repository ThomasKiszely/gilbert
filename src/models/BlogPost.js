const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    authorId: { type: mongoose.Types.ObjectId, ref: 'User' },
    image: { type: String, default: null },
    publishedAt: { type: Date, default: Date.now },
    }, { timestamps: true }
);

module.exports = mongoose.model("BlogPost", blogPostSchema);
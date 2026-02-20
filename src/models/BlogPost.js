const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    authorId: { type: mongoose.Types.ObjectId, ref: 'User' },
    image: { type: String, default: null },
    publishedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: false },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    }, { timestamps: true }
);

module.exports = mongoose.model("BlogPost", blogPostSchema);
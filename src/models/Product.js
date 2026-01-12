const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
    subcategory: {type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory'},
    brand: {type: mongoose.Schema.Types.ObjectId, ref: 'Brand'},
    gender: {type: String, enum: ['male', 'female', 'unisex']},
    size: {type: mongoose.Schema.Types.ObjectId, ref: 'Size'},
    condition: {type: mongoose.Schema.Types.ObjectId, ref: 'Condition'},
    color: {type: mongoose.Schema.Types.ObjectId, ref: 'Color'},
    material: {type: mongoose.Schema.Types.ObjectId, ref: 'Material'},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    price: Number,
    description: String,
    images: [String],
    documents: [String],
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});
module.exports = mongoose.model('Product', productSchema);
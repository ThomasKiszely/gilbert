const mongoose = require('mongoose');
const {genders} = require('../utils/gender');

const productSchema = new mongoose.Schema({
    title: {type: String, required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    subcategory: {type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true},
    brand: {type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true},
    gender: {type: String, enum: genders, required: true},
    size: {type: mongoose.Schema.Types.ObjectId, ref: 'Size', required: true},
    condition: {type: mongoose.Schema.Types.ObjectId, ref: 'Condition', required: true},
    color: {type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true},
    material: {type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true},],
    price: {type: Number, required: true},
    description: {type: String, required: true},
    images: {type: [String], required: true},
    documents: {type: [String], required: true},
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
},
{timestamps: true });
module.exports = mongoose.model('Product', productSchema);
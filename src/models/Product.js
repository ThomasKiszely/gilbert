const mongoose = require('mongoose');
const {statuses} = require('../utils/statusType');

const productSchema = new mongoose.Schema({
    title: {type: String, required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    subcategory: {type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true},
    brand: {type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true},
    gender: {type: mongoose.Schema.Types.ObjectId, ref: 'Gender', required: false},
    size: {type: mongoose.Schema.Types.ObjectId, ref: 'Size', default: null},
    condition: {type: mongoose.Schema.Types.ObjectId, ref: 'Condition', required: true},
    color: {type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true},
    material: {type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true},],
    price: {type: Number, required: true},
    description: {type: String, required: true},
    images: {type: [String], required: true},
    documents: {type: [String], default: []},
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: {type: String, enum: statuses, default: 'In Review'},
        weight: {
            type: Number,
            default: 1000,
            min: [100, 'Weight must be at least 100g'],
            max: [20000, 'Weight cannot exceed 20kg'],
            // 'set' runder automatisk op/ned til nærmeste heltal, hvis nogen sender 1000.5
            set: v => Math.round(v)
        },
},
{timestamps: true });
module.exports = mongoose.model('Product', productSchema);
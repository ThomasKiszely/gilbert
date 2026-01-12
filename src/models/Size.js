const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
    label: {type: String, required: true},
    type: {
        type: String,
        enum: ['Clothing', 'Shoes', 'Kids', 'Other'],
        required: true
    },
    categories: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
});
module.exports = mongoose.model('Size', sizeSchema);
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    gender: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gender' }],
});
module.exports = mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);
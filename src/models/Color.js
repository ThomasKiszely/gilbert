const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: String,
    hex: String
});
module.exports = mongoose.model('Color', colorSchema);
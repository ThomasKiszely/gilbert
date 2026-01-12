const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    name: String,
});
module.exports = mongoose.model('Condition', conditionSchema);
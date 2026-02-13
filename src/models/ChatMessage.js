const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    threadId: { type: mongoose.Types.ObjectId, ref: 'ChatThread', required: true },
    senderId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
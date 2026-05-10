/**
 * Chat Mongoose Model
 * Stores conversation history between user and AI Assistant.
 */
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: String, index: true },
    title: { type: String },
    text: { type: String, required: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

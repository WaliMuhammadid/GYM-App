import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

ChatMessageSchema.index({ userId: 1, timestamp: 1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);

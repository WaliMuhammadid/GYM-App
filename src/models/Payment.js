import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  plan: { type: String },
  method: { type: String, enum: ['cash', 'online', 'card'], default: 'cash' },
  collectedBy: { type: String, default: 'Cash Desk' },
  note: String,
}, { timestamps: true });

PaymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

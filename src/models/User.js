import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  plan: { type: String, enum: ['Basic', 'Gold', 'Platinum', 'None'], default: 'None' },
  fee: { type: Number, default: 0 },
  feeStatus: { type: String, enum: ['paid', 'overdue', 'pending'], default: 'pending' },
  feeDueDate: { type: Date },
  membershipExpiry: { type: Date },
  isBlocked: { type: Boolean, default: false },
  stats: {
    heartRate: { type: Number, default: 72 },
    steps: { type: Number, default: 0 },
    sleep: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
  },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  rank: { type: String, default: 'Beginner' },
  personalRecords: [{
    exercise: String,
    weight: Number,
    unit: { type: String, default: 'KG' },
    date: Date,
  }],
  calorieTarget: { type: Number, default: 2400 },
  proteinTarget: { type: Number, default: 180 },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

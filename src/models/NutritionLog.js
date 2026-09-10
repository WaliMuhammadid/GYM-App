import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
  dishName: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, default: 'g' },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  loggedAt: { type: Date, default: Date.now },
});

const NutritionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  meals: [MealSchema],
  dailyTotals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
}, { timestamps: true });

NutritionLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.NutritionLog || mongoose.model('NutritionLog', NutritionLogSchema);

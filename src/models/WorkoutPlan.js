import mongoose from 'mongoose';

const DetailedSetSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  targetKg: { type: Number, default: 20 },
  reps: { type: Number, default: 10 },
  setType: { type: String, default: 'working' }, // 'warmup', 'working', 'peak'
});

const ExerciseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '8-12' },
  startingWeight: { type: String, default: 'Moderate' },
  restTime: { type: Number, default: 90 }, // seconds
  notes: { type: String, default: '' },
  detailedSets: [DetailedSetSchema],
});

const DayPlanSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  dayName: { type: String, required: true }, // e.g. "Push Day: Chest, Shoulders & Triceps"
  shortTitle: { type: String, default: '' }, // e.g. "Chest & Triceps"
  targetMuscles: [{ type: String }],
  estimatedDuration: { type: Number, default: 45 }, // minutes
  exercises: [ExerciseItemSchema],
});

const WorkoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: {
    weight: { type: String, default: '' },
    height: { type: String, default: '' },
    age: { type: String, default: '' },
    goal: { type: String, default: 'Muscle Gain' },
    experienceLevel: { type: String, default: 'Beginner' }, // 'Beginner', 'Returning', 'Intermediate', 'Advanced'
    lastTrained: { type: String, default: 'Never' }, // 'Never', '1-2 weeks ago', '3-6 months ago', '1+ year ago'
    injuries: { type: String, default: 'None' },
    daysPerWeek: { type: Number, default: 4 },
  },
  splitName: { type: String, default: 'Custom AI Split' },
  days: [DayPlanSchema],
  aiNotes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

if (mongoose.models && mongoose.models.WorkoutPlan) {
  delete mongoose.models.WorkoutPlan;
}

export default mongoose.model('WorkoutPlan', WorkoutPlanSchema);

import mongoose from 'mongoose';

const SetSchema = new mongoose.Schema({
  kg: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroups: [String],
  sets: [SetSchema],
  restTime: { type: Number, default: 90 },
  notes: String,
});

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  exercises: [ExerciseSchema],
  duration: { type: Number, default: 0 },
  status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
  completedAt: Date,
}, { timestamps: true });

export default mongoose.models.Workout || mongoose.model('Workout', WorkoutSchema);

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';
import gymRoutes from './routes/gyms';
import coachRoutes from './routes/coach';
import dashboardRoutes from './routes/dashboard';
import nutritionRoutes from './routes/nutrition';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/nutrition', nutritionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

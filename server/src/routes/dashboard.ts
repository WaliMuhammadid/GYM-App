import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

// GET /api/dashboard — all dashboard data in one call
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const now = new Date();

    // Get start of current week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Workouts this week
    const weekWorkouts = await prisma.workoutSession.count({
      where: {
        userId,
        startedAt: { gte: startOfWeek },
        completedAt: { not: null },
      }
    });

    // PRs this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPRs = await prisma.personalRecord.count({
      where: {
        userId,
        achievedAt: { gte: startOfMonth },
      }
    });

    // User routines
    const routines = await prisma.routine.findMany({
      where: { userId },
      include: {
        exercises: { include: { exercise: true } },
      },
    });

    // Today's meals
    const todayMeals = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfToday },
      },
      orderBy: { loggedAt: 'asc' },
    });

    // Nutrition totals
    const nutritionTotals = todayMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.estimatedCalories || 0),
      protein: acc.protein + (meal.estimatedProteinG || 0),
      carbs: acc.carbs + (meal.estimatedCarbsG || 0),
      fat: acc.fat + (meal.estimatedFatG || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Recovery states
    const recovery = await prisma.muscleRecoveryState.findMany({
      where: { userId },
    });

    // Recent workout history (last 5)
    const recentWorkouts = await prisma.workoutSession.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        routine: true,
        setLogs: true,
      },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    // Calculate streak (consecutive days with workouts)
    let streak = 0;
    const checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate);
      dayStart.setDate(checkDate.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await prisma.workoutSession.count({
        where: {
          userId,
          completedAt: { not: null },
          startedAt: { gte: dayStart, lt: dayEnd },
        }
      });
      if (count > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    res.json({
      weekWorkouts,
      streak,
      monthPRs,
      routines: routines.map(r => ({
        id: r.id,
        name: r.name,
        exerciseCount: r.exercises.length,
        muscleGroups: [...new Set(r.exercises.map(e => e.exercise.muscleGroup))],
      })),
      todayMeals: todayMeals.map(m => ({
        id: m.id,
        text: m.rawInputText,
        calories: m.estimatedCalories,
        protein: m.estimatedProteinG,
        carbs: m.estimatedCarbsG,
        fat: m.estimatedFatG,
        loggedAt: m.loggedAt,
      })),
      nutritionTotals,
      recovery: recovery.map(r => ({
        muscleGroup: r.muscleGroup,
        status: r.status,
      })),
      recentWorkouts: recentWorkouts.map(w => ({
        id: w.id,
        name: w.routine?.name || 'Ad-hoc Workout',
        startedAt: w.startedAt,
        completedAt: w.completedAt,
        totalVolume: w.setLogs.reduce((sum, s) => sum + (s.weightKg || 0) * s.reps, 0),
        setCount: w.setLogs.length,
      })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;

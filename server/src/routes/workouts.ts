import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

// GET all workout history for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: {
        setLogs: {
          include: { exercise: true }
        },
        routine: true,
      },
      orderBy: { startedAt: 'desc' },
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// GET all routines for user
router.get('/routines', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let routines = await prisma.routine.findMany({
      where: { userId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' }
        },
      },
      orderBy: { id: 'asc' },
    });

    // If user has no routines yet, create 3 default starter routines
    if (routines.length === 0 && userId) {
      // Ensure exercises exist
      const defaultExercises = [
        { name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
        { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },
        { name: 'Tricep Rope Pushdown', muscleGroup: 'Triceps', equipment: 'Cable' },
        { name: 'Barbell Squat', muscleGroup: 'Quads', equipment: 'Barbell' },
        { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell' },
        { name: 'Overhead Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Barbell' },
        { name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
        { name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell' },
        { name: 'Dumbbell Bicep Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
      ];

      for (const ex of defaultExercises) {
        await prisma.exercise.upsert({
          where: { name: ex.name },
          update: {},
          create: ex,
        });
      }

      const allEx = await prisma.exercise.findMany();
      const exMap = new Map(allEx.map(e => [e.name, e.id]));

      // Routine 1: Chest & Triceps
      const r1 = await prisma.routine.create({
        data: {
          userId,
          name: 'Chest & Triceps Focus',
          exercises: {
            create: [
              { exerciseId: exMap.get('Barbell Bench Press')!, targetSets: 4, targetReps: 8, order: 1 },
              { exerciseId: exMap.get('Incline Dumbbell Press')!, targetSets: 3, targetReps: 10, order: 2 },
              { exerciseId: exMap.get('Tricep Rope Pushdown')!, targetSets: 3, targetReps: 12, order: 3 },
            ]
          }
        },
        include: { exercises: { include: { exercise: true } } }
      });

      // Routine 2: Back & Biceps
      const r2 = await prisma.routine.create({
        data: {
          userId,
          name: 'Back & Biceps Hypertrophy',
          exercises: {
            create: [
              { exerciseId: exMap.get('Barbell Row')!, targetSets: 4, targetReps: 8, order: 1 },
              { exerciseId: exMap.get('Lat Pulldown')!, targetSets: 3, targetReps: 10, order: 2 },
              { exerciseId: exMap.get('Dumbbell Bicep Curl')!, targetSets: 3, targetReps: 12, order: 3 },
            ]
          }
        },
        include: { exercises: { include: { exercise: true } } }
      });

      // Routine 3: Legs & Shoulders
      const r3 = await prisma.routine.create({
        data: {
          userId,
          name: 'Legs & Shoulders Power',
          exercises: {
            create: [
              { exerciseId: exMap.get('Barbell Squat')!, targetSets: 4, targetReps: 6, order: 1 },
              { exerciseId: exMap.get('Romanian Deadlift')!, targetSets: 3, targetReps: 8, order: 2 },
              { exerciseId: exMap.get('Overhead Shoulder Press')!, targetSets: 3, targetReps: 10, order: 3 },
            ]
          }
        },
        include: { exercises: { include: { exercise: true } } }
      });

      routines = [r1, r2, r3];
    }

    res.json(routines);
  } catch (error) {
    console.error('Fetch routines error:', error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

// POST /api/workouts/start
router.post('/start', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { routineId } = req.body;
    
    const session = await prisma.workoutSession.create({
      data: {
        userId: userId!,
        routineId: routineId || null,
      },
      include: {
        routine: {
          include: {
            exercises: { include: { exercise: true } }
          }
        }
      }
    });
    
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start workout' });
  }
});

// POST /api/workouts/log-set
router.post('/log-set', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, exerciseId, setNumber, weightKg, reps } = req.body;

    const setLog = await prisma.setLog.create({
      data: {
        sessionId,
        exerciseId,
        setNumber: Number(setNumber),
        weightKg: weightKg ? parseFloat(weightKg) : 0,
        reps: Number(reps),
      },
      include: { exercise: true }
    });

    // Check if new PR
    const userId = req.user?.userId;
    if (userId && exerciseId && weightKg) {
      const existingPR = await prisma.personalRecord.findFirst({
        where: { userId, exerciseId },
        orderBy: { weightKg: 'desc' }
      });

      if (!existingPR || parseFloat(weightKg) > existingPR.weightKg) {
        await prisma.personalRecord.create({
          data: {
            userId,
            exerciseId,
            weightKg: parseFloat(weightKg),
            reps: Number(reps),
          }
        });
      }
    }

    res.status(201).json(setLog);
  } catch (error) {
    console.error('Log set error:', error);
    res.status(500).json({ error: 'Failed to log set' });
  }
});

// POST /api/workouts/complete
router.post('/complete', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.body;

    const session = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { completedAt: new Date() },
      include: {
        setLogs: true,
        routine: true,
      }
    });

    // Award XP (100 XP per workout)
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: 100 },
        }
      });
    }

    res.json(session);
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Failed to complete workout' });
  }
});

export default router;

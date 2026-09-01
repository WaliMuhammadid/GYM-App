import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

// GET members for a gym
router.get('/:gymId/members', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gymId } = req.params;
    const userId = req.user?.userId;
    
    // Check if the user is a gym_admin and owns this gym
    const gym = await prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym || gym.ownerUserId !== userId) {
      res.status(403).json({ error: 'Unauthorized to view these members' });
      return;
    }

    const memberships = await prisma.gymMembership.findMany({
      where: { gymId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    res.json(memberships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

export default router;

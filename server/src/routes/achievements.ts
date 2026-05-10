import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const achievements = await prisma.achievement.findMany();
  res.json(achievements);
});

router.get('/mine', async (req: AuthRequest, res: Response): Promise<void> => {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: req.userId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
  });
  res.json(userAchievements);
});

export default router;

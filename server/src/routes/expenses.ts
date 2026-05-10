import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { checkAchievements } from '../services/achievementService';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const category = req.query.category as string | undefined;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const expenses = await prisma.expense.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(category ? { category } : {}),
    },
    include: { user: { select: { id: true, name: true, color: true } } },
    orderBy: { date: 'desc' },
  });
  res.json(expenses);
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, amount, description, date } = req.body;
  const expense = await prisma.expense.create({
    data: {
      userId: req.userId!,
      category,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
    },
    include: { user: { select: { id: true, name: true, color: true } } },
  });

  const newAchievements = await checkAchievements(req.userId!);
  res.json({ expense, newAchievements });
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const expense = await prisma.expense.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!expense || expense.userId !== req.userId) {
    res.status(403).json({ error: 'אין הרשאה' });
    return;
  }
  await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ ok: true });
});

export default router;

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const category = req.query.category as string | undefined;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const items = await prisma.income.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(category ? { category } : {}),
    },
    include: { user: { select: { id: true, name: true, color: true } } },
    orderBy: { date: 'desc' },
  });
  res.json(items);
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, amount, description, paymentMethod, date } = req.body;
  const item = await prisma.income.create({
    data: {
      userId: req.userId!,
      category,
      amount: parseFloat(amount),
      description,
      paymentMethod: paymentMethod || 'cash',
      date: date ? new Date(date) : new Date(),
    },
    include: { user: { select: { id: true, name: true, color: true } } },
  });
  res.json(item);
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const item = await prisma.income.findUnique({ where: { id: parseInt(req.params.id as string) } });
  if (!item || item.userId !== req.userId) {
    res.status(403).json({ error: 'אין הרשאה' });
    return;
  }
  await prisma.income.delete({ where: { id: parseInt(req.params.id as string) } });
  res.json({ ok: true });
});

export default router;

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const budgets = await prisma.budget.findMany({ where: { month, year } });
  res.json(budgets);
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, amount, month, year } = req.body;
  const budget = await prisma.budget.upsert({
    where: { category_month_year: { category, month, year } },
    update: { amount },
    create: { category, amount, month, year },
  });
  res.json(budget);
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount } = req.body;
  const budget = await prisma.budget.update({
    where: { id: parseInt(req.params.id as string) },
    data: { amount },
  });
  res.json(budget);
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.budget.delete({ where: { id: parseInt(req.params.id as string) } });
  res.json({ ok: true });
});

export default router;

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/monthly', async (req: AuthRequest, res: Response): Promise<void> => {
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [expenses, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      include: { user: { select: { id: true, name: true, color: true } } },
    }),
    prisma.budget.findMany({ where: { month, year } }),
  ]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSaved = Math.max(0, totalBudget - totalSpent);

  const byCategory: Record<string, { spent: number; budget: number }> = {};
  for (const b of budgets) {
    byCategory[b.category] = { spent: 0, budget: b.amount };
  }
  for (const e of expenses) {
    if (!byCategory[e.category]) byCategory[e.category] = { spent: 0, budget: 0 };
    byCategory[e.category].spent += e.amount;
  }

  const byUser: Record<string, { name: string; color: string; spent: number }> = {};
  for (const e of expenses) {
    const uid = String(e.userId);
    if (!byUser[uid]) byUser[uid] = { name: e.user.name, color: e.user.color, spent: 0 };
    byUser[uid].spent += e.amount;
  }

  res.json({ month, year, totalSpent, totalBudget, totalSaved, byCategory, byUser });
});

export default router;

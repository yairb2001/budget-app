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

  const [expenses, income, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      include: { user: { select: { id: true, name: true, color: true } } },
    }),
    prisma.income.findMany({
      where: { date: { gte: start, lte: end } },
      include: { user: { select: { id: true, name: true, color: true } } },
    }),
    prisma.budget.findMany({ where: { month, year } }),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome   = income.reduce((sum, i) => sum + i.amount, 0);
  const netProfit     = totalIncome - totalExpenses;
  const totalBudget   = budgets.reduce((sum, b) => sum + b.amount, 0);

  // Expense breakdown by category
  const byExpenseCategory: Record<string, { spent: number; budget: number }> = {};
  for (const b of budgets) {
    byExpenseCategory[b.category] = { spent: 0, budget: b.amount };
  }
  for (const e of expenses) {
    if (!byExpenseCategory[e.category]) byExpenseCategory[e.category] = { spent: 0, budget: 0 };
    byExpenseCategory[e.category].spent += e.amount;
  }

  // Income breakdown by category
  const byIncomeCategory: Record<string, number> = {};
  for (const i of income) {
    byIncomeCategory[i.category] = (byIncomeCategory[i.category] || 0) + i.amount;
  }

  // By user
  const byUser: Record<string, { name: string; color: string; spent: number }> = {};
  for (const e of expenses) {
    const uid = String(e.userId);
    if (!byUser[uid]) byUser[uid] = { name: e.user.name, color: e.user.color, spent: 0 };
    byUser[uid].spent += e.amount;
  }

  res.json({
    month, year,
    totalExpenses,
    totalIncome,
    netProfit,
    totalBudget,
    byExpenseCategory,
    byIncomeCategory,
    byUser,
    // backward compat
    byCategory: byExpenseCategory,
    totalSpent: totalExpenses,
    totalSaved: Math.max(0, totalBudget - totalExpenses),
  });
});

router.get('/yearly', async (req: AuthRequest, res: Response): Promise<void> => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31, 23, 59, 59);

  const [expenses, income, budgets] = await Promise.all([
    prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.income.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.budget.findMany({ where: { year } }),
  ]);

  const months: Record<number, { totalExpenses: number; totalIncome: number; totalBudget: number }> = {};
  for (let m = 1; m <= 12; m++) {
    months[m] = { totalExpenses: 0, totalIncome: 0, totalBudget: 0 };
  }

  for (const e of expenses) {
    const m = new Date(e.date).getMonth() + 1;
    months[m].totalExpenses += e.amount;
  }
  for (const i of income) {
    const m = new Date(i.date).getMonth() + 1;
    months[m].totalIncome += i.amount;
  }
  for (const b of budgets) {
    months[b.month].totalBudget += b.amount;
  }

  const result = Object.entries(months).map(([m, data]) => ({
    month: parseInt(m),
    year,
    totalExpenses: data.totalExpenses,
    totalIncome: data.totalIncome,
    netProfit: data.totalIncome - data.totalExpenses,
    totalBudget: data.totalBudget,
    hasData: data.totalExpenses > 0 || data.totalIncome > 0,
  }));

  res.json(result);
});

export default router;

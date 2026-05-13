import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const DEFAULT_EXPENSE_CATS = [
  { key: 'ציוד ומוצרים', icon: '✂️', color: '#FF7043', bg: '#FFF3F0', label: 'ציוד ומוצרים' },
  { key: 'שכר עובדים',   icon: '👥', color: '#42A5F5', bg: '#F0F7FF', label: 'שכר עובדים' },
  { key: 'שכ"ד ואחזקה', icon: '🏠', color: '#26A69A', bg: '#F0FAFA', label: 'שכ"ד ואחזקה' },
  { key: 'שיווק ופרסום', icon: '📣', color: '#AB47BC', bg: '#F9F0FF', label: 'שיווק ופרסום' },
  { key: 'הוצאות שוטפות',icon: '⚡', color: '#FFA726', bg: '#FFF8F0', label: 'הוצאות שוטפות' },
  { key: 'אחר',           icon: '📦', color: '#78909C', bg: '#F5F7F8', label: 'אחר' },
];

const DEFAULT_INCOME_CATS = [
  { key: 'תספורות',       icon: '✂️', color: '#4CAF50', bg: '#F0FFF1', label: 'תספורות' },
  { key: 'מכירת מוצרים', icon: '🛍️', color: '#2196F3', bg: '#F0F7FF', label: 'מכירת מוצרים' },
  { key: 'קורסי אקדמיה', icon: '🎓', color: '#FF9800', bg: '#FFF8F0', label: 'קורסי אקדמיה' },
  { key: 'השכרת כיסאות', icon: '💺', color: '#9C27B0', bg: '#F9F0FF', label: 'השכרת כיסאות' },
];

async function getCats(type: string, defaults: typeof DEFAULT_EXPENSE_CATS) {
  const stored = await prisma.categoryConfig.findMany({ where: { type } });
  return stored.length > 0 ? stored : defaults;
}

router.get('/expenses', async (_req: Request, res: Response): Promise<void> => {
  res.json(await getCats('expense', DEFAULT_EXPENSE_CATS));
});

router.get('/income', async (_req: Request, res: Response): Promise<void> => {
  res.json(await getCats('income', DEFAULT_INCOME_CATS));
});

router.put('/expenses', async (req: Request, res: Response): Promise<void> => {
  const cats = req.body as typeof DEFAULT_EXPENSE_CATS;
  // Replace all expense categories
  await prisma.categoryConfig.deleteMany({ where: { type: 'expense' } });
  await prisma.categoryConfig.createMany({
    data: cats.map(c => ({ type: 'expense', ...c })),
  });
  res.json({ ok: true });
});

router.put('/income', async (req: Request, res: Response): Promise<void> => {
  const cats = req.body as typeof DEFAULT_INCOME_CATS;
  await prisma.categoryConfig.deleteMany({ where: { type: 'income' } });
  await prisma.categoryConfig.createMany({
    data: cats.map(c => ({ type: 'income', ...c })),
  });
  res.json({ ok: true });
});

export default router;

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Extend Prisma schema note: add RecurringExpense model when running full server
// For now returns empty list gracefully if table doesn't exist
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await (prisma as any).recurringExpense.findMany({ orderBy: { dayOfMonth: 'asc' } });
    res.json(items);
  } catch { res.json([]); }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, amount, description, paymentMethod, dayOfMonth } = req.body;
  try {
    const item = await (prisma as any).recurringExpense.create({
      data: { category, amount: parseFloat(amount), description, paymentMethod, dayOfMonth: parseInt(dayOfMonth), active: true },
    });
    res.json(item);
  } catch (e) { res.status(400).json({ error: 'שגיאה' }); }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const item = await (prisma as any).recurringExpense.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(item);
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await (prisma as any).recurringExpense.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ ok: true });
});

export default router;

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).json({ error: 'שם וסיסמה נדרשים' });
    return;
  }
  const user = await prisma.user.findFirst({ where: { name } });
  if (!user) {
    res.status(401).json({ error: 'משתמש לא נמצא' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'סיסמה שגויה' });
    return;
  }
  const token = jwt.sign(
    { userId: user.id, userName: user.name },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, color: user.color } });
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, password, color } = req.body;
  if (!name || !password) {
    res.status(400).json({ error: 'שם וסיסמה נדרשים' });
    return;
  }
  const existing = await prisma.user.findFirst({ where: { name } });
  if (existing) {
    res.status(409).json({ error: 'שם המשתמש כבר קיים' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, passwordHash, color: color || '#6C63FF' },
  });
  const token = jwt.sign(
    { userId: user.id, userName: user.name },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, color: user.color } });
});

export default router;

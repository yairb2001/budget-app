import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import budgetsRoutes from './routes/budgets';
import expensesRoutes from './routes/expenses';
import incomeRoutes from './routes/income';
import statsRoutes from './routes/stats';
import achievementsRoutes from './routes/achievements';
import recurringRoutes from './routes/recurring';
import categoriesRoutes from './routes/categories';
import { authMiddleware } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/budgets', authMiddleware, budgetsRoutes);
app.use('/api/expenses', authMiddleware, expensesRoutes);
app.use('/api/income', authMiddleware, incomeRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/achievements', authMiddleware, achievementsRoutes);
app.use('/api/recurring', authMiddleware, recurringRoutes);
app.use('/api/categories', authMiddleware, categoriesRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve React app in production
if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function autoSeed() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('🌱 Seeding initial users...');
      const hash = await bcrypt.hash('1234', 10);
      await prisma.user.createMany({
        data: [
          { name: 'יאיר',  passwordHash: hash, color: '#1A1A2E' },
          { name: 'מנהל', passwordHash: hash, color: '#78909C' },
        ],
      });
      const achievements = [
        { key: 'first_expense', name: 'מתחילים!',       description: 'הוסיף הוצאה ראשונה',              icon: '🎯', color: '#6C63FF' },
        { key: 'green_month',   name: 'חודש ירוק',      description: 'עמדת בתקציב בכל הקטגוריות',       icon: '🌿', color: '#4CAF50' },
        { key: 'big_saver',     name: 'חוסך גדול',      description: 'חסכת מעל ₪1,000 בחודש',           icon: '💰', color: '#FFC107' },
        { key: 'week_streak',   name: '7 ימים ברצף',    description: 'הזנת הוצאות 7 ימים רצופים',       icon: '🔥', color: '#FF5722' },
        { key: 'couple_power',  name: 'כוח הצוות',     description: 'שניכם הזנתם פעולות באותו יום',    icon: '💑', color: '#FF6584' },
        { key: 'first_income',  name: 'הכנסה ראשונה!', description: 'הזנת הכנסה ראשונה',               icon: '💸', color: '#4CAF50' },
        { key: 'budget_master', name: 'מאסטר תקציב',   description: '3 חודשים רווחיים ברצף',            icon: '👑', color: '#FF9800' },
        { key: 'ten_expenses',  name: '10 הוצאות',      description: 'הזנת 10 הוצאות',                  icon: '📊', color: '#9C27B0' },
      ];
      for (const a of achievements) {
        await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a });
      }
      console.log('✅ Seed done.');
    }
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  await autoSeed();
});

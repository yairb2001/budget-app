import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import budgetsRoutes from './routes/budgets';
import expensesRoutes from './routes/expenses';
import statsRoutes from './routes/stats';
import achievementsRoutes from './routes/achievements';
import recurringRoutes from './routes/recurring';
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
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/achievements', authMiddleware, achievementsRoutes);
app.use('/api/recurring', authMiddleware, recurringRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve React app in production
if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
});

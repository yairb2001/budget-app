import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function checkAchievements(userId: number): Promise<
  Array<{ key: string; name: string; icon: string; color: string }>
> {
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  const allAchievements = await prisma.achievement.findMany();
  const newlyUnlocked: Array<{ key: string; name: string; icon: string; color: string }> = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const earned = await checkCondition(userId, achievement.key);
    if (earned) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newlyUnlocked.push({
        key: achievement.key,
        name: achievement.name,
        icon: achievement.icon,
        color: achievement.color,
      });
    }
  }

  return newlyUnlocked;
}

async function checkCondition(userId: number, key: string): Promise<boolean> {
  switch (key) {
    case 'first_expense': {
      const count = await prisma.expense.count({ where: { userId } });
      return count >= 1;
    }

    case 'ten_expenses': {
      const count = await prisma.expense.count({ where: { userId } });
      return count >= 10;
    }

    case 'first_budget': {
      const count = await prisma.budget.count();
      return count >= 1;
    }

    case 'green_month': {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const [expenses, budgets] = await Promise.all([
        prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
        prisma.budget.findMany({ where: { month, year } }),
      ]);

      if (budgets.length === 0) return false;
      const byCategory: Record<string, number> = {};
      for (const e of expenses) {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      }
      return budgets.every((b) => (byCategory[b.category] || 0) <= b.amount);
    }

    case 'big_saver': {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const [expenses, budgets] = await Promise.all([
        prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
        prisma.budget.findMany({ where: { month, year } }),
      ]);
      const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
      const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
      return totalBudget - totalSpent >= 1000;
    }

    case 'week_streak': {
      const expenses = await prisma.expense.findMany({
        where: { userId },
        select: { date: true },
        orderBy: { date: 'desc' },
      });
      const days = new Set(expenses.map((e) => e.date.toISOString().split('T')[0]));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (days.has(d.toISOString().split('T')[0])) {
          streak++;
          if (streak >= 7) return true;
        } else {
          break;
        }
      }
      return false;
    }

    case 'couple_power': {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const expenses = await prisma.expense.findMany({
        where: { date: { gte: start, lt: end } },
        select: { userId: true },
      });
      const users = new Set(expenses.map((e) => e.userId));
      return users.size >= 2;
    }

    case 'under_food': {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const [expenses, budget] = await Promise.all([
        prisma.expense.findMany({ where: { category: 'מזון וסופר', date: { gte: start, lte: end } } }),
        prisma.budget.findFirst({ where: { category: 'מזון וסופר', month, year } }),
      ]);
      if (!budget) return false;
      const spent = expenses.reduce((s, e) => s + e.amount, 0);
      return spent <= budget.amount;
    }

    case 'budget_master': {
      // Check last 3 months all green
      const results: boolean[] = [];
      for (let i = 1; i <= 3; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const [expenses, budgets] = await Promise.all([
          prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
          prisma.budget.findMany({ where: { month, year } }),
        ]);
        if (budgets.length === 0) { results.push(false); continue; }
        const byCategory: Record<string, number> = {};
        for (const e of expenses) byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        results.push(budgets.every((b) => (byCategory[b.category] || 0) <= b.amount));
      }
      return results.every(Boolean);
    }

    default:
      return false;
  }
}

const now = new Date();
const MONTH = now.getMonth() + 1;
const YEAR = now.getFullYear();

const USERS = [
  { id: 1, name: 'יאיר', color: '#6C63FF', password: '1234' },
  { id: 2, name: 'אשתי', color: '#FF6584', password: '1234' },
];

const ALL_ACHIEVEMENTS = [
  { id: 1, key: 'first_expense', name: 'מתחילים!', description: 'הוסיף הוצאה ראשונה', icon: '🎯', color: '#6C63FF' },
  { id: 2, key: 'green_month', name: 'חודש ירוק', description: 'עמדת בתקציב בכל הקטגוריות', icon: '🌿', color: '#4CAF50' },
  { id: 3, key: 'big_saver', name: 'חוסך גדול', description: 'חסכת מעל ₪1,000 בחודש', icon: '💰', color: '#FFC107' },
  { id: 4, key: 'week_streak', name: '7 ימים ברצף', description: 'הזנת הוצאות 7 ימים רצופים', icon: '🔥', color: '#FF5722' },
  { id: 5, key: 'couple_power', name: 'כוח הזוג', description: 'שניכם הזנתם הוצאות באותו יום', icon: '💑', color: '#FF6584' },
  { id: 6, key: 'under_food', name: 'אכלנו טוב', description: 'נשארתם מתחת לתקציב מזון', icon: '🥗', color: '#8BC34A' },
  { id: 7, key: 'budget_master', name: 'מאסטר תקציב', description: '3 חודשים ירוקים ברצף', icon: '👑', color: '#FF9800' },
  { id: 8, key: 'first_budget', name: 'מתכננים!', description: 'הגדרת תקציב לראשונה', icon: '📋', color: '#2196F3' },
  { id: 9, key: 'ten_expenses', name: '10 הוצאות', description: 'הזנת 10 הוצאות', icon: '📊', color: '#9C27B0' },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}
function save(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }
function nextId(items: { id: number }[]) { return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1; }

function seedIfNeeded() {
  if (localStorage.getItem('mock_seeded_v2')) return;

  const budgets = [
    { id: 1, category: 'מזון וסופר', amount: 3000, month: MONTH, year: YEAR },
    { id: 2, category: 'תחבורה', amount: 1200, month: MONTH, year: YEAR },
    { id: 3, category: 'בילויים', amount: 800, month: MONTH, year: YEAR },
    { id: 4, category: 'חשבונות קבועים', amount: 6000, month: MONTH, year: YEAR },
  ];

  const d = (daysAgo: number, dayOfMonth?: number) => {
    if (dayOfMonth !== undefined) {
      return new Date(YEAR, MONTH - 1, dayOfMonth).toISOString();
    }
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo); return dt.toISOString();
  };

  const recurringTemplates = [
    { id: 1, category: 'חשבונות קבועים', amount: 4200, description: 'שכר דירה', paymentMethod: 'bank', dayOfMonth: 1, active: true },
    { id: 2, category: 'תחבורה', amount: 380, description: 'ביטוח רכב', paymentMethod: 'credit', dayOfMonth: 5, active: true },
    { id: 3, category: 'חשבונות קבועים', amount: 99, description: 'אינטרנט', paymentMethod: 'credit', dayOfMonth: 10, active: true },
    { id: 4, category: 'חשבונות קבועים', amount: 250, description: 'ביטוח בריאות', paymentMethod: 'bank', dayOfMonth: 15, active: true },
    { id: 5, category: 'חשבונות קבועים', amount: 180, description: 'נטפליקס + ספוטיפיי', paymentMethod: 'credit', dayOfMonth: 8, active: true },
  ];
  save('mock_recurring', recurringTemplates);

  const expenses: any[] = [
    { id: 1, userId: 1, category: 'מזון וסופר', amount: 480, description: 'שופרסל', paymentMethod: 'credit', date: d(1), user: USERS[0], isRecurring: false },
    { id: 2, userId: 2, category: 'מזון וסופר', amount: 230, description: 'רמי לוי', paymentMethod: 'cash', date: d(2), user: USERS[1], isRecurring: false },
    { id: 3, userId: 1, category: 'תחבורה', amount: 180, description: 'דלק', paymentMethod: 'credit', date: d(2), user: USERS[0], isRecurring: false },
    { id: 4, userId: 2, category: 'בילויים', amount: 180, description: 'סרט + פופקורן', paymentMethod: 'bit', date: d(3), user: USERS[1], isRecurring: false },
    { id: 5, userId: 1, category: 'מזון וסופר', amount: 310, description: 'קצביה', paymentMethod: 'cash', date: d(5), user: USERS[0], isRecurring: false },
    { id: 6, userId: 2, category: 'בילויים', amount: 220, description: 'מסעדה', paymentMethod: 'bit', date: d(7), user: USERS[1], isRecurring: false },
  ];

  // Auto-apply recurring to current month
  let maxId = 10;
  recurringTemplates.forEach(r => {
    expenses.push({
      id: ++maxId,
      userId: 1,
      category: r.category,
      amount: r.amount,
      description: r.description,
      paymentMethod: r.paymentMethod,
      date: d(0, Math.min(r.dayOfMonth, new Date(YEAR, MONTH, 0).getDate())),
      user: USERS[0],
      isRecurring: true,
      recurringId: r.id,
    });
  });

  save('mock_budgets', budgets);
  save('mock_expenses', expenses);

  const userAchievements = [
    { userId: 1, achievementKey: 'first_expense', unlockedAt: d(7) },
    { userId: 1, achievementKey: 'first_budget', unlockedAt: d(8) },
    { userId: 2, achievementKey: 'first_expense', unlockedAt: d(6) },
    { userId: 2, achievementKey: 'first_budget', unlockedAt: d(8) },
    { userId: 1, achievementKey: 'couple_power', unlockedAt: d(3) },
    { userId: 2, achievementKey: 'couple_power', unlockedAt: d(3) },
  ];
  save('mock_user_achievements', userAchievements);
  save('mock_seeded_v2', true);
}

function getExpensesRaw() { return load<any[]>('mock_expenses', []); }
function getBudgetsRaw() { return load<any[]>('mock_budgets', []); }
function getUserAchievements() { return load<any[]>('mock_user_achievements', []); }
function getRecurringRaw() { return load<any[]>('mock_recurring', []); }

function getCurrentUser(): { id: number; name: string; color: string } | null {
  return load('mock_current_user', null);
}

// Auto-apply recurring expenses to a month if not already applied
function ensureRecurringApplied(month: number, year: number) {
  const recurring = getRecurringRaw().filter((r: any) => r.active);
  const expenses = getExpensesRaw();
  const appliedIds = new Set(
    expenses
      .filter((e: any) => e.recurringId && new Date(e.date).getMonth() + 1 === month && new Date(e.date).getFullYear() === year)
      .map((e: any) => e.recurringId)
  );

  const toAdd: any[] = [];
  let maxId = expenses.length ? Math.max(...expenses.map((e: any) => e.id)) : 0;
  const daysInMonth = new Date(year, month, 0).getDate();

  recurring.forEach((r: any) => {
    if (appliedIds.has(r.id)) return;
    toAdd.push({
      id: ++maxId,
      userId: 1,
      category: r.category,
      amount: r.amount,
      description: r.description,
      paymentMethod: r.paymentMethod,
      date: new Date(year, month - 1, Math.min(r.dayOfMonth, daysInMonth)).toISOString(),
      user: USERS[0],
      isRecurring: true,
      recurringId: r.id,
    });
  });

  if (toAdd.length > 0) {
    expenses.push(...toAdd);
    save('mock_expenses', expenses);
  }
}

// ── Achievement checker ──────────────────────────────────────────────────

function checkAndUnlockAchievements(userId: number): Array<{ key: string; name: string; icon: string; color: string }> {
  const expenses = getExpensesRaw();
  const budgets = getBudgetsRaw().filter((b: any) => b.month === MONTH && b.year === YEAR);
  const userAchs = getUserAchievements();
  const myAchKeys = new Set(userAchs.filter((a: any) => a.userId === userId).map((a: any) => a.achievementKey));
  const newlyUnlocked: any[] = [];

  const unlock = (key: string) => {
    if (myAchKeys.has(key)) return;
    const ach = ALL_ACHIEVEMENTS.find(a => a.key === key);
    if (!ach) return;
    userAchs.push({ userId, achievementKey: key, unlockedAt: new Date().toISOString() });
    save('mock_user_achievements', userAchs);
    newlyUnlocked.push({ key: ach.key, name: ach.name, icon: ach.icon, color: ach.color });
  };

  const myExpenses = expenses.filter((e: any) => e.userId === userId);
  if (myExpenses.length >= 1) unlock('first_expense');
  if (myExpenses.length >= 10) unlock('ten_expenses');
  if (budgets.length >= 1) unlock('first_budget');

  const byCategory: Record<string, number> = {};
  expenses.filter((e: any) => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === MONTH && d.getFullYear() === YEAR;
  }).forEach((e: any) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  if (budgets.length > 0 && budgets.every((b: any) => (byCategory[b.category] || 0) <= b.amount)) unlock('green_month');

  const totalSpent = Object.values(byCategory).reduce((s: number, v) => s + (v as number), 0);
  const totalBudget = budgets.reduce((s: number, b: any) => s + b.amount, 0);
  if (totalBudget - totalSpent >= 1000) unlock('big_saver');

  const foodBudget = budgets.find((b: any) => b.category === 'מזון וסופר');
  if (foodBudget && (byCategory['מזון וסופר'] || 0) <= foodBudget.amount) unlock('under_food');

  const today = new Date().toISOString().split('T')[0];
  const usersToday = new Set(expenses.filter((e: any) => e.date.startsWith(today)).map((e: any) => e.userId));
  if (usersToday.size >= 2) unlock('couple_power');

  return newlyUnlocked;
}

// ── Public API ───────────────────────────────────────────────────────────

export const mockApi = {
  login: async (name: string, password: string) => {
    seedIfNeeded();
    const user = USERS.find(u => u.name === name && u.password === password);
    if (!user) throw new Error('שם משתמש או סיסמה שגויים');
    const { password: _p, ...safeUser } = user;
    save('mock_current_user', safeUser);
    return { token: `mock-token-${user.id}`, user: safeUser };
  },

  getStats: async (month: number, year: number) => {
    ensureRecurringApplied(month, year);
    const expenses = getExpensesRaw().filter((e: any) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    const budgets = getBudgetsRaw().filter((b: any) => b.month === month && b.year === year);

    const totalSpent = expenses.reduce((s: number, e: any) => s + e.amount, 0);
    const totalBudget = budgets.reduce((s: number, b: any) => s + b.amount, 0);
    const totalSaved = Math.max(0, totalBudget - totalSpent);

    const byCategory: Record<string, { spent: number; budget: number }> = {};
    budgets.forEach((b: any) => { byCategory[b.category] = { spent: 0, budget: b.amount }; });
    expenses.forEach((e: any) => {
      if (!byCategory[e.category]) byCategory[e.category] = { spent: 0, budget: 0 };
      byCategory[e.category].spent += e.amount;
    });

    const byUser: Record<string, { name: string; color: string; spent: number }> = {};
    expenses.forEach((e: any) => {
      const uid = String(e.userId);
      if (!byUser[uid]) byUser[uid] = { name: e.user.name, color: e.user.color, spent: 0 };
      byUser[uid].spent += e.amount;
    });

    return { month, year, totalSpent, totalBudget, totalSaved, byCategory, byUser };
  },

  getBudgets: async (month: number, year: number) =>
    getBudgetsRaw().filter((b: any) => b.month === month && b.year === year),

  upsertBudget: async (category: string, amount: number, month: number, year: number) => {
    const budgets = getBudgetsRaw();
    const idx = budgets.findIndex((b: any) => b.category === category && b.month === month && b.year === year);
    if (idx >= 0) { budgets[idx].amount = amount; }
    else { budgets.push({ id: nextId(budgets), category, amount, month, year }); }
    save('mock_budgets', budgets);
    return budgets.find((b: any) => b.category === category && b.month === month && b.year === year);
  },

  deleteBudget: async (id: number) => {
    save('mock_budgets', getBudgetsRaw().filter((b: any) => b.id !== id));
    return { ok: true };
  },

  getExpenses: async (month: number, year: number, category?: string) => {
    ensureRecurringApplied(month, year);
    return getExpensesRaw()
      .filter((e: any) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year &&
          (!category || e.category === category);
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addExpense: async (data: { category: string; amount: number; description?: string; paymentMethod?: string; date?: string }) => {
    const user = getCurrentUser();
    if (!user) throw new Error('לא מחובר');
    const expenses = getExpensesRaw();
    const expense = {
      id: nextId(expenses),
      userId: user.id,
      category: data.category,
      amount: data.amount,
      description: data.description || null,
      paymentMethod: data.paymentMethod || 'credit',
      date: data.date || new Date().toISOString(),
      user,
      isRecurring: false,
    };
    expenses.unshift(expense);
    save('mock_expenses', expenses);
    const newAchievements = checkAndUnlockAchievements(user.id);
    return { expense, newAchievements };
  },

  deleteExpense: async (id: number) => {
    save('mock_expenses', getExpensesRaw().filter((e: any) => e.id !== id));
    return { ok: true };
  },

  // ── Recurring ─────────────────────────────────────────────────────────

  getRecurring: async () => getRecurringRaw(),

  addRecurring: async (data: { category: string; amount: number; description: string; paymentMethod: string; dayOfMonth: number }) => {
    const list = getRecurringRaw();
    const item = { id: nextId(list), ...data, active: true };
    list.push(item);
    save('mock_recurring', list);
    return item;
  },

  updateRecurring: async (id: number, data: Partial<{ category: string; amount: number; description: string; paymentMethod: string; dayOfMonth: number; active: boolean }>) => {
    const list = getRecurringRaw();
    const idx = list.findIndex((r: any) => r.id === id);
    if (idx >= 0) { list[idx] = { ...list[idx], ...data }; save('mock_recurring', list); }
    return list[idx];
  },

  deleteRecurring: async (id: number) => {
    save('mock_recurring', getRecurringRaw().filter((r: any) => r.id !== id));
    return { ok: true };
  },

  // ── Achievements ──────────────────────────────────────────────────────

  getAchievements: async () => ALL_ACHIEVEMENTS,

  getMyAchievements: async () => {
    const user = getCurrentUser();
    if (!user) return [];
    return getUserAchievements()
      .filter((a: any) => a.userId === user.id)
      .map((a: any) => ({
        unlockedAt: a.unlockedAt,
        achievement: ALL_ACHIEVEMENTS.find(ach => ach.key === a.achievementKey)!,
      }))
      .filter((a: any) => a.achievement)
      .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
  },
};

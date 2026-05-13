import { CATEGORIES, INCOME_CATEGORIES, getStoredExpenseCategories, getStoredIncomeCategories, saveExpenseCategories, saveIncomeCategories } from '../theme';

const now = new Date();
const MONTH = now.getMonth() + 1;
const YEAR = now.getFullYear();

const USERS = [
  { id: 1, name: 'יאיר',  color: '#1A1A2E', password: '1234' },
  { id: 2, name: 'מנהל',  color: '#78909C', password: '1234' },
];

const ALL_ACHIEVEMENTS = [
  { id: 1, key: 'first_expense',    name: 'מתחילים לנהל!',    description: 'רשמת הוצאה ראשונה',               icon: '✂️', color: '#6C63FF' },
  { id: 2, key: 'first_income',     name: 'הכנסה ראשונה!',    description: 'רשמת הכנסה ראשונה',               icon: '💰', color: '#4CAF50' },
  { id: 3, key: 'profitable_month', name: 'חודש רווחי!',      description: 'הכנסות עלו על הוצאות',            icon: '📈', color: '#2196F3' },
  { id: 4, key: 'revenue_goal',     name: 'יעד הכנסות!',      description: 'הכנסות מעל ₪30,000 בחודש',        icon: '🎯', color: '#FF9800' },
  { id: 5, key: 'cost_control',     name: 'שליטה בעלויות!',   description: 'הוצאות מתחת ל-80% מההכנסות',     icon: '🛡️', color: '#26A69A' },
  { id: 6, key: 'academy_income',   name: 'האקדמיה עולה!',    description: 'רשמת הכנסה מקורסי אקדמיה',       icon: '🎓', color: '#AB47BC' },
  { id: 7, key: 'ten_expenses',     name: 'מנהל מקצועי!',     description: 'הזנת 10 הוצאות',                  icon: '📊', color: '#FF7043' },
  { id: 8, key: 'week_streak',      name: 'שבוע פעיל!',       description: 'הזנת נתונים 7 ימים ברצף',         icon: '🔥', color: '#FF5722' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}
function save(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }
function nextId(items: { id: number }[]) { return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1; }

function pastMonthYear(off: number): { month: number; year: number } {
  let m = MONTH - off;
  let y = YEAR;
  while (m <= 0) { m += 12; y -= 1; }
  return { month: m, year: y };
}

// ── Seed ─────────────────────────────────────────────────────────────────────

function seedIfNeeded() {
  if (localStorage.getItem('mock_seeded_v4')) return;

  // Seed default categories
  saveExpenseCategories(CATEGORIES);
  saveIncomeCategories(INCOME_CATEGORIES);

  // Recurring expenses (barbershop fixed costs)
  const recurringTemplates = [
    { id: 1, category: 'שכ"ד ואחזקה',    amount: 6500, description: 'שכר דירה',         paymentMethod: 'bank',   dayOfMonth: 1,  active: true },
    { id: 2, category: 'שכ"ד ואחזקה',    amount: 400,  description: 'ועד בית + ניהול',   paymentMethod: 'bank',   dayOfMonth: 1,  active: true },
    { id: 3, category: 'הוצאות שוטפות',   amount: 350,  description: 'תוכנת ניהול תורים', paymentMethod: 'credit', dayOfMonth: 5,  active: true },
    { id: 4, category: 'שכ"ד ואחזקה',    amount: 450,  description: 'ביטוח עסק',         paymentMethod: 'bank',   dayOfMonth: 15, active: true },
    { id: 5, category: 'הוצאות שוטפות',   amount: 100,  description: 'Spotify Business',  paymentMethod: 'credit', dayOfMonth: 8,  active: true },
  ];
  save('mock_recurring', recurringTemplates);

  // ── Budgets ──
  const budgets: any[] = [
    { id: 1, category: 'ציוד ומוצרים',  amount: 5000,  month: MONTH, year: YEAR },
    { id: 2, category: 'שכר עובדים',    amount: 15000, month: MONTH, year: YEAR },
    { id: 3, category: 'שכ"ד ואחזקה',  amount: 9000,  month: MONTH, year: YEAR },
    { id: 4, category: 'שיווק ופרסום',  amount: 2500,  month: MONTH, year: YEAR },
    { id: 5, category: 'הוצאות שוטפות', amount: 2000,  month: MONTH, year: YEAR },
  ];

  const d = (daysAgo: number, dayOfMonth?: number, y = YEAR, m = MONTH) => {
    if (dayOfMonth !== undefined) {
      return new Date(y, m - 1, Math.min(dayOfMonth, new Date(y, m, 0).getDate())).toISOString();
    }
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo); return dt.toISOString();
  };

  // ── Current month expenses (manual) ──
  const expenses: any[] = [
    { id:  1, userId: 1, category: 'ציוד ומוצרים',  amount: 1800, description: 'הזמנת מוצרי שיער - L\'Oréal',  paymentMethod: 'credit', date: d(3),  user: USERS[0], isRecurring: false },
    { id:  2, userId: 1, category: 'ציוד ומוצרים',  amount: 950,  description: 'מספריות וסכיני גילוח',           paymentMethod: 'credit', date: d(7),  user: USERS[0], isRecurring: false },
    { id:  3, userId: 1, category: 'שכר עובדים',    amount: 7000, description: 'משכורת - אלון',                  paymentMethod: 'bank',   date: d(1),  user: USERS[0], isRecurring: false },
    { id:  4, userId: 1, category: 'שכר עובדים',    amount: 6500, description: 'משכורת - שחר',                   paymentMethod: 'bank',   date: d(1),  user: USERS[0], isRecurring: false },
    { id:  5, userId: 1, category: 'שיווק ופרסום',  amount: 900,  description: 'קמפיין אינסטגרם',                paymentMethod: 'credit', date: d(5),  user: USERS[0], isRecurring: false },
    { id:  6, userId: 2, category: 'שיווק ופרסום',  amount: 750,  description: 'צלם + עריכה',                    paymentMethod: 'bit',    date: d(10), user: USERS[1], isRecurring: false },
    { id:  7, userId: 1, category: 'ציוד ומוצרים',  amount: 620,  description: 'חומרי ניקוי וכלים קטנים',        paymentMethod: 'cash',   date: d(12), user: USERS[0], isRecurring: false },
  ];

  // Apply recurring to current month
  let expId = 20;
  recurringTemplates.forEach(r => {
    expenses.push({ id: ++expId, userId: 1, category: r.category, amount: r.amount, description: r.description, paymentMethod: r.paymentMethod, date: d(0, r.dayOfMonth), user: USERS[0], isRecurring: true, recurringId: r.id });
  });

  // ── Current month income ──
  const income: any[] = [
    { id:  1, userId: 1, category: 'תספורות',       amount: 4200, description: 'שבוע 1',      paymentMethod: 'cash',   date: d(6),  user: USERS[0] },
    { id:  2, userId: 1, category: 'תספורות',       amount: 3800, description: 'שבוע 2',      paymentMethod: 'cash',   date: d(13), user: USERS[0] },
    { id:  3, userId: 1, category: 'תספורות',       amount: 2200, description: 'שבוע 3',      paymentMethod: 'credit', date: d(3),  user: USERS[0] },
    { id:  4, userId: 1, category: 'מכירת מוצרים', amount: 1400, description: 'ג\'לים ושמפו', paymentMethod: 'credit', date: d(4),  user: USERS[0] },
    { id:  5, userId: 2, category: 'מכירת מוצרים', amount: 900,  description: 'מוצרי לחות',  paymentMethod: 'bit',    date: d(9),  user: USERS[1] },
    { id:  6, userId: 1, category: 'קורסי אקדמיה', amount: 5500, description: 'קורס ספר - 2 סטודנטים', paymentMethod: 'bank', date: d(2), user: USERS[0] },
    { id:  7, userId: 1, category: 'קורסי אקדמיה', amount: 3200, description: 'סדנת זקן',    paymentMethod: 'bit',    date: d(8),  user: USERS[0] },
    { id:  8, userId: 1, category: 'השכרת כיסאות', amount: 1600, description: 'אייל - שכ"ד חודשי',   paymentMethod: 'bank', date: d(1), user: USERS[0] },
    { id:  9, userId: 1, category: 'השכרת כיסאות', amount: 1600, description: 'ניר - שכ"ד חודשי',    paymentMethod: 'bank', date: d(1), user: USERS[0] },
  ];

  save('mock_expenses', expenses);
  save('mock_income', income);

  // ── Historical data (5 past months) ──
  const history = [
    { off: 1, income: { תספורות: 16200, 'מכירת מוצרים': 2400, 'קורסי אקדמיה': 7800, 'השכרת כיסאות': 3200 }, expenses: { 'ציוד ומוצרים': 4100, 'שכר עובדים': 13500, 'שיווק ופרסום': 1600 } },
    { off: 2, income: { תספורות: 21000, 'מכירת מוצרים': 3100, 'קורסי אקדמיה': 12000, 'השכרת כיסאות': 3200 }, expenses: { 'ציוד ומוצרים': 5200, 'שכר עובדים': 14500, 'שיווק ופרסום': 2800 } },
    { off: 3, income: { תספורות: 13500, 'מכירת מוצרים': 1900, 'קורסי אקדמיה': 3500, 'השכרת כיסאות': 3200  }, expenses: { 'ציוד ומוצרים': 3800, 'שכר עובדים': 13500, 'שיווק ופרסום': 900  } },
    { off: 4, income: { תספורות: 18500, 'מכירת מוצרים': 2700, 'קורסי אקדמיה': 9000, 'השכרת כיסאות': 3200  }, expenses: { 'ציוד ומוצרים': 4400, 'שכר עובדים': 14000, 'שיווק ופרסום': 1800 } },
    { off: 5, income: { תספורות: 17800, 'מכירת מוצרים': 2500, 'קורסי אקדמיה': 8500, 'השכרת כיסאות': 3200  }, expenses: { 'ציוד ומוצרים': 4000, 'שכר עובדים': 14000, 'שיווק ופרסום': 1500 } },
  ];

  let budId = 10;
  history.forEach(({ off, income: incData, expenses: expData }) => {
    const { month: pm, year: py } = pastMonthYear(off);
    const daysInMonth = new Date(py, pm, 0).getDate();

    // Budgets
    budgets.push(
      { id: ++budId, category: 'ציוד ומוצרים',  amount: 5000,  month: pm, year: py },
      { id: ++budId, category: 'שכר עובדים',    amount: 15000, month: pm, year: py },
      { id: ++budId, category: 'שכ"ד ואחזקה',  amount: 9000,  month: pm, year: py },
      { id: ++budId, category: 'שיווק ופרסום',  amount: 2500,  month: pm, year: py },
      { id: ++budId, category: 'הוצאות שוטפות', amount: 2000,  month: pm, year: py },
    );

    // Recurring expenses
    recurringTemplates.forEach(r => {
      expenses.push({ id: ++expId, userId: 1, category: r.category, amount: r.amount, description: r.description, paymentMethod: r.paymentMethod, date: new Date(py, pm - 1, Math.min(r.dayOfMonth, daysInMonth)).toISOString(), user: USERS[0], isRecurring: true, recurringId: r.id });
    });

    // Manual expenses
    Object.entries(expData).forEach(([cat, amt]) => {
      expenses.push({ id: ++expId, userId: 1, category: cat, amount: amt as number, description: cat, paymentMethod: 'bank', date: new Date(py, pm - 1, 5).toISOString(), user: USERS[0], isRecurring: false });
    });

    // Income entries
    let incId = income.length ? Math.max(...income.map((i: any) => i.id)) : 0;
    Object.entries(incData).forEach(([cat, amt]) => {
      income.push({ id: ++incId, userId: 1, category: cat, amount: amt as number, description: cat, paymentMethod: cat === 'תספורות' ? 'cash' : 'bank', date: new Date(py, pm - 1, 10).toISOString(), user: USERS[0] });
    });
  });

  save('mock_budgets', budgets);
  save('mock_expenses', expenses);
  save('mock_income', income);

  save('mock_user_achievements', [
    { userId: 1, achievementKey: 'first_expense',    unlockedAt: new Date(YEAR, MONTH - 1, 1).toISOString() },
    { userId: 1, achievementKey: 'first_income',     unlockedAt: new Date(YEAR, MONTH - 1, 1).toISOString() },
    { userId: 1, achievementKey: 'profitable_month', unlockedAt: new Date(YEAR, MONTH - 1, 2).toISOString() },
  ]);

  save('mock_seeded_v4', true);
}

// ── Raw getters ───────────────────────────────────────────────────────────────

function getExpensesRaw() { return load<any[]>('mock_expenses', []); }
function getBudgetsRaw()  { return load<any[]>('mock_budgets', []); }
function getIncomeRaw()   { return load<any[]>('mock_income', []); }
function getUserAchievements() { return load<any[]>('mock_user_achievements', []); }
function getRecurringRaw()     { return load<any[]>('mock_recurring', []); }

function getCurrentUser(): { id: number; name: string; color: string } | null {
  return load('mock_current_user', null);
}

// ── Recurring auto-apply ──────────────────────────────────────────────────────

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
    toAdd.push({ id: ++maxId, userId: 1, category: r.category, amount: r.amount, description: r.description, paymentMethod: r.paymentMethod, date: new Date(year, month - 1, Math.min(r.dayOfMonth, daysInMonth)).toISOString(), user: USERS[0], isRecurring: true, recurringId: r.id });
  });
  if (toAdd.length > 0) { expenses.push(...toAdd); save('mock_expenses', expenses); }
}

// ── Achievement checker ───────────────────────────────────────────────────────

function checkAndUnlockAchievements(userId: number): Array<{ key: string; name: string; icon: string; color: string }> {
  const expenses = getExpensesRaw();
  const incomeEntries = getIncomeRaw();
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
    myAchKeys.add(key);
  };

  const myExpenses = expenses.filter((e: any) => e.userId === userId);
  if (myExpenses.length >= 1) unlock('first_expense');
  if (myExpenses.length >= 10) unlock('ten_expenses');

  const myIncome = incomeEntries.filter((i: any) => i.userId === userId);
  if (myIncome.length >= 1) unlock('first_income');
  if (myIncome.some((i: any) => i.category === 'קורסי אקדמיה')) unlock('academy_income');

  const monthIncome = incomeEntries.filter((i: any) => {
    const d = new Date(i.date);
    return d.getMonth() + 1 === MONTH && d.getFullYear() === YEAR;
  }).reduce((s: number, i: any) => s + i.amount, 0);

  const monthExpenses = expenses.filter((e: any) => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === MONTH && d.getFullYear() === YEAR;
  }).reduce((s: number, e: any) => s + e.amount, 0);

  if (monthIncome > monthExpenses && monthIncome > 0) unlock('profitable_month');
  if (monthIncome >= 30000) unlock('revenue_goal');
  if (monthIncome > 0 && monthExpenses / monthIncome < 0.8) unlock('cost_control');

  return newlyUnlocked;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const mockApi = {
  login: async (name: string, password: string) => {
    seedIfNeeded();
    // Check built-in users first
    const builtIn = USERS.find(u => u.name === name && u.password === password);
    if (builtIn) {
      const { password: _p, ...safeUser } = builtIn;
      save('mock_current_user', safeUser);
      return { token: `mock-token-${builtIn.id}`, user: safeUser };
    }
    // Check registered users
    const registered: any[] = load('mock_registered_users', []);
    const regUser = registered.find((u: any) => u.name === name && u.password === password);
    if (!regUser) throw new Error('שם משתמש או סיסמה שגויים');
    const { password: _p, ...safeUser } = regUser;
    save('mock_current_user', safeUser);
    return { token: `mock-token-${regUser.id}`, user: safeUser };
  },

  register: async (name: string, password: string, color: string) => {
    seedIfNeeded();
    const allUsers = [...USERS, ...load<any[]>('mock_registered_users', [])];
    if (allUsers.some((u: any) => u.name === name)) throw new Error('שם המשתמש כבר קיים');
    const registered: any[] = load('mock_registered_users', []);
    const newUser = { id: 100 + registered.length + 1, name, color, password };
    registered.push(newUser);
    save('mock_registered_users', registered);
    const { password: _p, ...safeUser } = newUser;
    save('mock_current_user', safeUser);
    return { token: `mock-token-${newUser.id}`, user: safeUser };
  },

  getStats: async (month: number, year: number) => {
    seedIfNeeded();
    ensureRecurringApplied(month, year);
    const expenses = getExpensesRaw().filter((e: any) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    const incomeEntries = getIncomeRaw().filter((i: any) => {
      const d = new Date(i.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    const budgets = getBudgetsRaw().filter((b: any) => b.month === month && b.year === year);

    const totalExpenses = expenses.reduce((s: number, e: any) => s + e.amount, 0);
    const totalIncome   = incomeEntries.reduce((s: number, i: any) => s + i.amount, 0);
    const totalBudget   = budgets.reduce((s: number, b: any) => s + b.amount, 0);
    const netProfit     = totalIncome - totalExpenses;

    const byExpenseCategory: Record<string, { spent: number; budget: number }> = {};
    budgets.forEach((b: any) => { byExpenseCategory[b.category] = { spent: 0, budget: b.amount }; });
    expenses.forEach((e: any) => {
      if (!byExpenseCategory[e.category]) byExpenseCategory[e.category] = { spent: 0, budget: 0 };
      byExpenseCategory[e.category].spent += e.amount;
    });

    const byIncomeCategory: Record<string, { amount: number }> = {};
    incomeEntries.forEach((i: any) => {
      if (!byIncomeCategory[i.category]) byIncomeCategory[i.category] = { amount: 0 };
      byIncomeCategory[i.category].amount += i.amount;
    });

    const byUser: Record<string, { name: string; color: string; spent: number }> = {};
    expenses.forEach((e: any) => {
      const uid = String(e.userId);
      if (!byUser[uid]) byUser[uid] = { name: e.user.name, color: e.user.color, spent: 0 };
      byUser[uid].spent += e.amount;
    });

    // backward compat fields
    return { month, year, totalExpenses, totalIncome, netProfit, totalBudget, totalSaved: Math.max(0, totalBudget - totalExpenses), byExpenseCategory, byIncomeCategory, byUser, byCategory: byExpenseCategory };
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

  deleteBudget: async (id: number) => { save('mock_budgets', getBudgetsRaw().filter((b: any) => b.id !== id)); return { ok: true }; },

  getExpenses: async (month: number, year: number, category?: string) => {
    ensureRecurringApplied(month, year);
    return getExpensesRaw()
      .filter((e: any) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year && (!category || e.category === category);
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addExpense: async (data: { category: string; amount: number; description?: string; paymentMethod?: string; date?: string }) => {
    const user = getCurrentUser();
    if (!user) throw new Error('לא מחובר');
    const expenses = getExpensesRaw();
    const expense = { id: nextId(expenses), userId: user.id, category: data.category, amount: data.amount, description: data.description || null, paymentMethod: data.paymentMethod || 'credit', date: data.date || new Date().toISOString(), user, isRecurring: false };
    expenses.unshift(expense);
    save('mock_expenses', expenses);
    const newAchievements = checkAndUnlockAchievements(user.id);
    return { expense, newAchievements };
  },

  deleteExpense: async (id: number) => { save('mock_expenses', getExpensesRaw().filter((e: any) => e.id !== id)); return { ok: true }; },

  // ── Income ──────────────────────────────────────────────────────────────────

  getIncome: async (month: number, year: number, category?: string) => {
    return getIncomeRaw()
      .filter((i: any) => {
        const d = new Date(i.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year && (!category || i.category === category);
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addIncome: async (data: { category: string; amount: number; description?: string; paymentMethod?: string; date?: string }) => {
    const user = getCurrentUser();
    if (!user) throw new Error('לא מחובר');
    const incomeList = getIncomeRaw();
    const entry = { id: nextId(incomeList), userId: user.id, category: data.category, amount: data.amount, description: data.description || null, paymentMethod: data.paymentMethod || 'cash', date: data.date || new Date().toISOString(), user };
    incomeList.unshift(entry);
    save('mock_income', incomeList);
    const newAchievements = checkAndUnlockAchievements(user.id);
    return { income: entry, newAchievements };
  },

  deleteIncome: async (id: number) => { save('mock_income', getIncomeRaw().filter((i: any) => i.id !== id)); return { ok: true }; },

  // ── Recurring ───────────────────────────────────────────────────────────────

  getRecurring: async () => getRecurringRaw(),

  addRecurring: async (data: any) => {
    const list = getRecurringRaw();
    const item = { id: nextId(list), ...data, active: true };
    list.push(item);
    save('mock_recurring', list);
    return item;
  },

  updateRecurring: async (id: number, data: any) => {
    const list = getRecurringRaw();
    const idx = list.findIndex((r: any) => r.id === id);
    if (idx >= 0) { list[idx] = { ...list[idx], ...data }; save('mock_recurring', list); }
    return list[idx];
  },

  deleteRecurring: async (id: number) => { save('mock_recurring', getRecurringRaw().filter((r: any) => r.id !== id)); return { ok: true }; },

  // ── Categories ──────────────────────────────────────────────────────────────

  getExpenseCategories: async () => getStoredExpenseCategories(),
  getIncomeCategories:  async () => getStoredIncomeCategories(),
  saveExpenseCategories: async (cats: any[]) => { saveExpenseCategories(cats); return cats; },
  saveIncomeCategories:  async (cats: any[]) => { saveIncomeCategories(cats); return cats; },

  // ── Year Stats ───────────────────────────────────────────────────────────────

  getYearStats: async (year: number) => {
    seedIfNeeded();
    const allExpenses = getExpensesRaw();
    const allIncome   = getIncomeRaw();
    const allBudgets  = getBudgetsRaw();
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const me = allExpenses.filter((e: any) => { const d = new Date(e.date); return d.getMonth() + 1 === month && d.getFullYear() === year; });
      const mi = allIncome.filter((i: any) => { const d = new Date(i.date); return d.getMonth() + 1 === month && d.getFullYear() === year; });
      const mb = allBudgets.filter((b: any) => b.month === month && b.year === year);
      const totalExpenses = me.reduce((s: number, e: any) => s + e.amount, 0);
      const totalIncome   = mi.reduce((s: number, i: any) => s + i.amount, 0);
      const totalBudget   = mb.reduce((s: number, b: any) => s + b.amount, 0);
      return { month, year, totalExpenses, totalIncome, netProfit: totalIncome - totalExpenses, totalBudget, hasData: mb.length > 0 || me.length > 0 || mi.length > 0 };
    });
  },

  // ── Achievements ─────────────────────────────────────────────────────────────

  getAchievements: async () => ALL_ACHIEVEMENTS,

  getMyAchievements: async () => {
    const user = getCurrentUser();
    if (!user) return [];
    return getUserAchievements()
      .filter((a: any) => a.userId === user.id)
      .map((a: any) => ({ unlockedAt: a.unlockedAt, achievement: ALL_ACHIEVEMENTS.find(ach => ach.key === a.achievementKey)! }))
      .filter((a: any) => a.achievement)
      .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
  },
};

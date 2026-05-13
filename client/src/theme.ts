export type Category = { key: string; icon: string; color: string; bg: string; label: string };

// Default expense categories for DOMINANT Barbers
export const CATEGORIES: Category[] = [
  { key: 'ציוד ומוצרים', icon: '✂️', color: '#FF7043', bg: '#FFF3F0', label: 'ציוד ומוצרים' },
  { key: 'שכר עובדים',   icon: '👥', color: '#42A5F5', bg: '#F0F7FF', label: 'שכר עובדים' },
  { key: 'שכ"ד ואחזקה', icon: '🏠', color: '#26A69A', bg: '#F0FAFA', label: 'שכ"ד ואחזקה' },
  { key: 'שיווק ופרסום', icon: '📣', color: '#AB47BC', bg: '#F9F0FF', label: 'שיווק ופרסום' },
  { key: 'הוצאות שוטפות',icon: '⚡', color: '#FFA726', bg: '#FFF8F0', label: 'הוצאות שוטפות' },
  { key: 'אחר',           icon: '📦', color: '#78909C', bg: '#F5F7F8', label: 'אחר' },
];

// Default income categories
export const INCOME_CATEGORIES: Category[] = [
  { key: 'תספורות',        icon: '✂️', color: '#4CAF50', bg: '#F0FFF1', label: 'תספורות' },
  { key: 'מכירת מוצרים',  icon: '🛍️', color: '#2196F3', bg: '#F0F7FF', label: 'מכירת מוצרים' },
  { key: 'קורסי אקדמיה',  icon: '🎓', color: '#FF9800', bg: '#FFF8F0', label: 'קורסי אקדמיה' },
  { key: 'השכרת כיסאות',  icon: '💺', color: '#9C27B0', bg: '#F9F0FF', label: 'השכרת כיסאות' },
];

// ── Dynamic category helpers (read from localStorage, fall back to defaults) ──

export function getStoredExpenseCategories(): Category[] {
  try {
    const s = localStorage.getItem('bus_expense_cats');
    return s ? JSON.parse(s) : CATEGORIES;
  } catch { return CATEGORIES; }
}

export function getStoredIncomeCategories(): Category[] {
  try {
    const s = localStorage.getItem('bus_income_cats');
    return s ? JSON.parse(s) : INCOME_CATEGORIES;
  } catch { return INCOME_CATEGORIES; }
}

export function saveExpenseCategories(cats: Category[]) {
  localStorage.setItem('bus_expense_cats', JSON.stringify(cats));
}

export function saveIncomeCategories(cats: Category[]) {
  localStorage.setItem('bus_income_cats', JSON.stringify(cats));
}

export function getCategoryInfo(key: string): Category {
  const all = [...getStoredExpenseCategories(), ...getStoredIncomeCategories()];
  return all.find((c) => c.key === key) ?? { key, icon: '📦', color: '#78909C', bg: '#F5F7F8', label: key };
}

export function getProgressColor(pct: number): string {
  if (pct <= 70) return '#4CAF50';
  if (pct <= 90) return '#FFC107';
  if (pct <= 100) return '#FF9800';
  return '#F44336';
}

export function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
}

export const PAYMENT_METHODS = [
  { key: 'credit', icon: '💳', label: 'אשראי' },
  { key: 'cash',   icon: '💵', label: 'מזומן' },
  { key: 'bit',    icon: '📱', label: 'ביט' },
  { key: 'bank',   icon: '🏦', label: 'העברה' },
  { key: 'check',  icon: '📝', label: "צ'ק" },
];

export function getPaymentMethod(key?: string) {
  return PAYMENT_METHODS.find((p) => p.key === key) ?? PAYMENT_METHODS[0];
}

export const MONTH_NAMES = [
  '', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

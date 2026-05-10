export const CATEGORIES = [
  { key: 'מזון וסופר', icon: '🛒', color: '#FF7043', bg: '#FFF3F0', label: 'מזון וסופר' },
  { key: 'תחבורה', icon: '🚗', color: '#42A5F5', bg: '#F0F7FF', label: 'תחבורה' },
  { key: 'בילויים', icon: '🎬', color: '#AB47BC', bg: '#F9F0FF', label: 'בילויים' },
  { key: 'חשבונות קבועים', icon: '🏠', color: '#26A69A', bg: '#F0FAFA', label: 'חשבונות קבועים' },
  { key: 'קניות', icon: '🛍️', color: '#EC407A', bg: '#FFF0F5', label: 'קניות' },
  { key: 'בריאות', icon: '💊', color: '#66BB6A', bg: '#F0FFF1', label: 'בריאות' },
  { key: 'חינוך', icon: '📚', color: '#FFA726', bg: '#FFF8F0', label: 'חינוך' },
  { key: 'אחר', icon: '📦', color: '#78909C', bg: '#F5F7F8', label: 'אחר' },
];

export function getCategoryInfo(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? {
    key,
    icon: '📦',
    color: '#78909C',
    bg: '#F5F7F8',
    label: key,
  };
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
  { key: 'cash', icon: '💵', label: 'מזומן' },
  { key: 'bit', icon: '📱', label: 'ביט' },
  { key: 'bank', icon: '🏦', label: 'העברה' },
  { key: 'check', icon: '📝', label: "צ'ק" },
];

export function getPaymentMethod(key?: string) {
  return PAYMENT_METHODS.find((p) => p.key === key) ?? PAYMENT_METHODS[0];
}

export const MONTH_NAMES = [
  '', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

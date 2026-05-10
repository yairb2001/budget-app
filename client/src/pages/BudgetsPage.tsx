import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { CATEGORIES, formatCurrency, MONTH_NAMES } from '../theme';
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';
import RecurringExpenses from '../components/RecurringExpenses';

interface Budget {
  id: number;
  category: string;
  amount: number;
  month: number;
  year: number;
}

export default function BudgetsPage() {
  const { currentMonth, currentYear, triggerRefresh } = useApp();
  const [tab, setTab] = useState<'budget' | 'recurring'>('budget');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '' });

  useEffect(() => {
    setLoading(true);
    api.getBudgets(currentMonth, currentYear)
      .then(setBudgets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  async function saveBudget(category: string) {
    const amount = parseFloat(editValue);
    if (isNaN(amount) || amount < 0) return;
    await api.upsertBudget(category, amount, currentMonth, currentYear);
    const updated = await api.getBudgets(currentMonth, currentYear);
    setBudgets(updated as Budget[]);
    triggerRefresh();
    setEditing(null);
    setToast({ visible: true, message: `תקציב עודכן ל-${formatCurrency(amount)}` });
  }

  const total = budgets.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="pb-24">
      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={() => setToast({ visible: false, message: '' })}
        emoji="💾"
      />

      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 text-white"
        style={{ background: tab === 'budget'
          ? 'linear-gradient(135deg, #26A69A 0%, #42A5F5 100%)'
          : 'linear-gradient(135deg, #6C63FF 0%, #AB47BC 100%)' }}
      >
        <h1 className="text-2xl font-black">
          {tab === 'budget' ? 'תקציב חודשי 📋' : 'הוצאות קבועות 📌'}
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </p>
        {tab === 'budget' && (
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 mt-4 text-center">
            <p className="text-white/70 text-xs">סה"כ תקציב</p>
            <p className="text-2xl font-black">{formatCurrency(total)}</p>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex mx-5 mt-4 bg-gray-100 rounded-2xl p-1 gap-1">
        {([
          { key: 'budget', label: '📋 תקציב חודשי' },
          { key: 'recurring', label: '📌 הוצאות קבועות' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? '#6C63FF' : '#999',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'budget' ? (
          <motion.div
            key="budget"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-5 pt-4 space-y-3"
          >
            <p className="text-sm text-gray-500 font-medium">הקש על קטגוריה לעריכת התקציב</p>

            {CATEGORIES.map((cat, i) => {
              const budget = budgets.find((b) => b.category === cat.key);
              const isEditing = editing === cat.key;

              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  style={{ borderRight: `4px solid ${cat.color}` }}
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => {
                      if (!isEditing) {
                        setEditing(cat.key);
                        setEditValue(String(budget?.amount ?? ''));
                      } else {
                        setEditing(null);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: cat.bg }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{cat.label}</p>
                        {budget ? (
                          <p className="text-xs text-gray-500">{formatCurrency(budget.amount)} לחודש</p>
                        ) : (
                          <p className="text-xs text-gray-400">לא הוגדר</p>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg">{isEditing ? '✕' : '✏️'}</span>
                  </div>

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₪</span>
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="0"
                              autoFocus
                              className="w-full bg-gray-50 rounded-xl py-3 pr-8 pl-3 outline-none focus:ring-2 transition font-bold text-gray-800"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveBudget(cat.key);
                                if (e.key === 'Escape') setEditing(null);
                              }}
                            />
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => saveBudget(cat.key)}
                            className="px-5 rounded-xl text-white font-bold text-sm"
                            style={{ background: cat.color }}
                          >
                            שמור
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="recurring"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <RecurringExpenses />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

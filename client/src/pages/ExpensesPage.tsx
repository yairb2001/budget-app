import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { getCategoryInfo, getPaymentMethod, formatCurrency, MONTH_NAMES, CATEGORIES } from '../theme';
import { useApp } from '../context/AppContext';
import ExpenseModal from '../components/ExpenseModal';
import AchievementPopup from '../components/Confetti';

interface Expense {
  id: number;
  userId: number;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  user: { id: number; name: string; color: string };
}

export default function ExpensesPage() {
  const { currentMonth, currentYear, refreshKey, triggerRefresh } = useApp();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingAch, setPendingAch] = useState<{ key: string; name: string; icon: string; color: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getExpenses(currentMonth, currentYear)
      .then(setExpenses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear, refreshKey]);

  async function deleteExpense(id: number) {
    if (!confirm('למחוק הוצאה זו?')) return;
    await api.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    triggerRefresh();
  }

  const filtered = filterCat ? expenses.filter((e) => e.category === filterCat) : expenses;
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  function groupByDate(expenses: Expense[]) {
    const groups: Record<string, Expense[]> = {};
    for (const e of expenses) {
      const date = new Date(e.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    }
    return groups;
  }

  const groups = groupByDate(filtered);

  return (
    <div className="pb-24">
      <AchievementPopup achievement={pendingAch} onDone={() => setPendingAch(null)} />

      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #AB47BC 0%, #6C63FF 100%)' }}
      >
        <h1 className="text-2xl font-black">הוצאות 📊</h1>
        <p className="text-white/70 text-sm mt-1">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </p>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-3 mt-4 text-center">
          <p className="text-white/70 text-xs">סה"כ הוצאות</p>
          <p className="text-2xl font-black">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="px-5 pt-4 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          <button
            onClick={() => setFilterCat(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              !filterCat ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            הכל
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterCat(filterCat === cat.key ? null : cat.key)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1"
              style={{
                background: filterCat === cat.key ? cat.color : cat.bg,
                color: filterCat === cat.key ? 'white' : cat.color,
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses list */}
      <div className="px-5 pt-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : Object.keys(groups).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🌵</p>
            <p className="font-medium">אין הוצאות להציג</p>
            <p className="text-sm">הוסיפו את ההוצאה הראשונה שלכם!</p>
          </div>
        ) : (
          Object.entries(groups).map(([date, exps]) => (
            <div key={date}>
              <p className="text-xs font-bold text-gray-400 mb-2 px-1">{date}</p>
              <div className="space-y-2">
                <AnimatePresence>
                  {exps.map((expense) => {
                    const info = getCategoryInfo(expense.category);
                    return (
                      <motion.div
                        key={expense.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: info.bg }}
                        >
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {expense.description || info.label}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {(expense as any).isRecurring && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">📌 קבועה</span>
                            )}
                            <span className="text-xs text-gray-400">{getPaymentMethod((expense as any).paymentMethod).icon} {getPaymentMethod((expense as any).paymentMethod).label}</span>
                            <span className="text-xs" style={{ color: expense.user.color }}>· {expense.user.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-800">{formatCurrency(expense.amount)}</span>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full text-white text-3xl shadow-2xl flex items-center justify-center z-30"
        style={{ background: 'linear-gradient(135deg, #6C63FF, #AB47BC)' }}
      >
        +
      </motion.button>

      <ExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(achs) => {
          if (achs[0]) setPendingAch(achs[0]);
        }}
      />
    </div>
  );
}

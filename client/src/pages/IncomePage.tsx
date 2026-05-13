import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { getCategoryInfo, getPaymentMethod, formatCurrency, MONTH_NAMES, getStoredIncomeCategories } from '../theme';
import { useApp } from '../context/AppContext';
import IncomeModal from '../components/IncomeModal';
import AchievementPopup from '../components/Confetti';
import Toast from '../components/Toast';

interface IncomeEntry {
  id: number;
  userId: number;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  paymentMethod: string;
  user: { id: number; name: string; color: string };
}

export default function IncomePage() {
  const { currentMonth, currentYear, setMonth, refreshKey, triggerRefresh } = useApp();
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingAch, setPendingAch] = useState<{ key: string; name: string; icon: string; color: string } | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const cats = getStoredIncomeCategories();

  const now = new Date();
  const isCurrentMonth = currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();

  function prevMonth() {
    if (currentMonth === 1) setMonth(12, currentYear - 1);
    else setMonth(currentMonth - 1, currentYear);
  }
  function nextMonth() {
    if (isCurrentMonth) return;
    if (currentMonth === 12) setMonth(1, currentYear + 1);
    else setMonth(currentMonth + 1, currentYear);
  }

  useEffect(() => {
    setLoading(true);
    (api as any).getIncome(currentMonth, currentYear)
      .then(setIncome)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear, refreshKey]);

  async function deleteEntry(id: number) {
    if (!confirm('למחוק הכנסה זו?')) return;
    await (api as any).deleteIncome(id);
    setIncome((prev) => prev.filter((e) => e.id !== id));
    triggerRefresh();
  }

  const filtered = filterCat ? income.filter((e) => e.category === filterCat) : income;
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  function groupByDate(entries: IncomeEntry[]) {
    const groups: Record<string, IncomeEntry[]> = {};
    for (const e of entries) {
      const date = new Date(e.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    }
    return groups;
  }

  const groups = groupByDate(filtered);

  // Category totals for mini summary
  const catTotals = cats.map(cat => ({
    ...cat,
    total: income.filter(e => e.category === cat.key).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0);

  return (
    <div className="pb-24">
      <Toast visible={toast.visible} message={toast.message} onHide={() => setToast({ visible: false, message: '' })} emoji="💰" />
      <AchievementPopup achievement={pendingAch} onDone={() => setPendingAch(null)} />

      {/* Header */}
      <div className="px-5 pt-12 pb-6 text-white" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-white/80 text-sm">הכנסות</p>
            <div className="flex items-center gap-2 mt-0.5">
              <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-white/20 active:bg-white/40 flex items-center justify-center text-white text-lg leading-none">‹</button>
              <h1 className="text-xl font-black">{MONTH_NAMES[currentMonth]} {currentYear}</h1>
              <button onClick={nextMonth} disabled={isCurrentMonth} className="w-7 h-7 rounded-full bg-white/20 active:bg-white/40 flex items-center justify-center text-white text-lg leading-none disabled:opacity-30">›</button>
            </div>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
          <p className="text-white/70 text-xs">סה"כ הכנסות</p>
          <p className="text-2xl font-black">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Category summary chips */}
      {catTotals.length > 0 && (
        <div className="px-5 pt-4 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            <button
              onClick={() => setFilterCat(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!filterCat ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              הכל
            </button>
            {catTotals.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilterCat(filterCat === cat.key ? null : cat.key)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                style={{ background: filterCat === cat.key ? cat.color : cat.bg, color: filterCat === cat.key ? 'white' : cat.color }}
              >
                {cat.icon} {cat.label} — {formatCurrency(cat.total)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Income list */}
      <div className="px-5 pt-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : Object.keys(groups).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">💸</p>
            <p className="font-medium">אין הכנסות לחודש זה</p>
            <p className="text-sm">לחץ + כדי להוסיף הכנסה</p>
          </div>
        ) : (
          Object.entries(groups).map(([date, entries]) => (
            <div key={date}>
              <p className="text-xs font-bold text-gray-400 mb-2 px-1">{date}</p>
              <div className="space-y-2">
                <AnimatePresence>
                  {entries.map((entry) => {
                    const info = getCategoryInfo(entry.category);
                    const pm = getPaymentMethod(entry.paymentMethod);
                    return (
                      <motion.div
                        key={entry.id} layout
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3"
                        style={{ borderRight: `4px solid ${info.color}` }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: info.bg }}>
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">{entry.description || info.label}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{pm.icon} {pm.label}</span>
                            <span className="text-xs" style={{ color: entry.user.color }}>· {entry.user.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-green-600">{formatCurrency(entry.amount)}</span>
                          <button onClick={() => deleteEntry(entry.id)} className="text-gray-300 hover:text-red-400 transition text-lg leading-none">×</button>
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
        whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full text-white text-3xl shadow-2xl flex items-center justify-center z-30"
        style={{ background: 'linear-gradient(135deg, #4CAF50, #2196F3)' }}
      >
        +
      </motion.button>

      <IncomeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(achs) => {
          if (achs[0]) setPendingAch(achs[0]);
          setToast({ visible: true, message: 'הכנסה נרשמה בהצלחה!' });
          triggerRefresh();
        }}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { formatCurrency, MONTH_NAMES, getCategoryInfo } from '../theme';
import CategoryCard from '../components/CategoryCard';
import ExpenseModal from '../components/ExpenseModal';
import IncomeModal from '../components/IncomeModal';
import AchievementPopup from '../components/Confetti';
import Toast from '../components/Toast';

interface Stats {
  totalExpenses: number;
  totalIncome: number;
  netProfit: number;
  totalBudget: number;
  byExpenseCategory: Record<string, { spent: number; budget: number }>;
  byIncomeCategory: Record<string, { amount: number }>;
  byUser: Record<string, { name: string; color: string; spent: number }>;
}

export default function Dashboard() {
  const { user, currentMonth, currentYear, setMonth, refreshKey } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [pendingAch, setPendingAch] = useState<{ key: string; name: string; icon: string; color: string } | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Array<{ key: string; name: string; icon: string; color: string }>>([]);
  const [toast, setToast] = useState({ visible: false, message: '' });

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
    api.getStats(currentMonth, currentYear)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear, refreshKey]);

  function handleAchievements(achs: Array<{ key: string; name: string; icon: string; color: string }>) {
    if (achs.length > 0) { setAchievementQueue(achs.slice(1)); setPendingAch(achs[0]); }
  }
  function handleAchievementDone() {
    if (achievementQueue.length > 0) { setPendingAch(achievementQueue[0]); setAchievementQueue(q => q.slice(1)); }
    else setPendingAch(null);
  }

  const expenseCategories = stats
    ? Object.entries(stats.byExpenseCategory).sort((a, b) => {
        const pA = a[1].budget > 0 ? a[1].spent / a[1].budget : 0;
        const pB = b[1].budget > 0 ? b[1].spent / b[1].budget : 0;
        return pB - pA;
      })
    : [];

  const incomeCategoryEntries = stats ? Object.entries(stats.byIncomeCategory) : [];
  const profitPct = stats && stats.totalIncome > 0 ? (stats.netProfit / stats.totalIncome) * 100 : 0;
  const isProfitable = (stats?.netProfit ?? 0) >= 0;

  return (
    <div className="pb-24">
      <Toast visible={toast.visible} message={toast.message} onHide={() => setToast({ visible: false, message: '' })} emoji="✅" />
      <AchievementPopup achievement={pendingAch} onDone={handleAchievementDone} />

      {/* Header */}
      <div className="px-5 pt-12 pb-6 text-white" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-white/60 text-xs tracking-widest uppercase">DOMINANT Barbers</p>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-white/10 active:bg-white/30 flex items-center justify-center text-white text-lg leading-none">‹</button>
              <h1 className="text-xl font-black">{MONTH_NAMES[currentMonth]} {currentYear}</h1>
              <button onClick={nextMonth} disabled={isCurrentMonth} className="w-7 h-7 rounded-full bg-white/10 active:bg-white/30 flex items-center justify-center text-white text-lg leading-none disabled:opacity-20">›</button>
            </div>
            <p className="text-white/50 text-xs mt-0.5">שלום, {user?.name} 👋</p>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black shadow-lg flex-shrink-0" style={{ background: user?.color || '#6C63FF', color: 'white' }}>
            {user?.name?.[0]}
          </div>
        </div>

        {/* P&L 3 cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-500/20 backdrop-blur rounded-2xl p-3 text-center border border-green-400/20">
            <p className="text-white/60 text-[10px]">הכנסות</p>
            <p className="text-base font-black text-green-300">{formatCurrency(stats?.totalIncome ?? 0)}</p>
          </div>
          <div className="bg-red-500/20 backdrop-blur rounded-2xl p-3 text-center border border-red-400/20">
            <p className="text-white/60 text-[10px]">הוצאות</p>
            <p className="text-base font-black text-red-300">{formatCurrency(stats?.totalExpenses ?? 0)}</p>
          </div>
          <div className={`backdrop-blur rounded-2xl p-3 text-center border ${isProfitable ? 'bg-blue-500/20 border-blue-400/20' : 'bg-red-600/20 border-red-500/20'}`}>
            <p className="text-white/60 text-[10px]">רווח נקי</p>
            <p className={`text-base font-black ${isProfitable ? 'text-blue-300' : 'text-red-400'}`}>
              {isProfitable ? '' : '-'}{formatCurrency(Math.abs(stats?.netProfit ?? 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Profit bar */}
        {stats && stats.totalIncome > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">{isProfitable ? '📈 רווחיות החודש' : '📉 גירעון החודש'}</span>
              <span className={`text-sm font-black ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>{Math.round(Math.abs(profitPct))}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: isProfitable ? 'linear-gradient(90deg, #4CAF50, #2196F3)' : '#F44336' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.abs(profitPct), 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
              <span>הכנסות: {formatCurrency(stats.totalIncome)}</span>
              <span>הוצאות: {formatCurrency(stats.totalExpenses)}</span>
            </div>
          </motion.div>
        )}

        {/* Income breakdown */}
        {incomeCategoryEntries.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-gray-700 text-sm mb-3">פירוט הכנסות</p>
            <div className="space-y-2.5">
              {incomeCategoryEntries.map(([cat, data]) => {
                const info = getCategoryInfo(cat);
                const pct = stats!.totalIncome > 0 ? (data.amount / stats!.totalIncome) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{info.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{cat}</span>
                        <span className="text-xs font-bold text-green-600">{formatCurrency(data.amount)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: info.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expense categories */}
        <div>
          <p className="font-bold text-gray-700 text-sm mb-3">מעקב תקציב הוצאות</p>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
          ) : expenseCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-medium">הגדר תקציב בעמוד ההגדרות</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenseCategories.map(([cat, data], i) => (
                <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <CategoryCard category={cat} spent={data.spent} budget={data.budget} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB — two buttons: + הוצאה / + הכנסה */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        <motion.button
          whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
          onClick={() => setShowExpenseModal(true)}
          className="w-14 h-14 rounded-full text-white text-2xl shadow-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FF7043, #AB47BC)' }}
          title="הוסף הוצאה"
        >
          📊
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
          onClick={() => setShowIncomeModal(true)}
          className="w-14 h-14 rounded-full text-white text-2xl shadow-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4CAF50, #2196F3)' }}
          title="הוסף הכנסה"
        >
          💰
        </motion.button>
      </div>

      <ExpenseModal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} onSuccess={(achs) => { handleAchievements(achs); setToast({ visible: true, message: 'הוצאה נרשמה!' }); }} />
      <IncomeModal  open={showIncomeModal}  onClose={() => setShowIncomeModal(false)}  onSuccess={(achs) => { handleAchievements(achs); setToast({ visible: true, message: 'הכנסה נרשמה!' }); }} />
    </div>
  );
}

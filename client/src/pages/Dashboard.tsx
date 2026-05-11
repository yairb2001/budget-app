import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { formatCurrency, MONTH_NAMES, getCategoryInfo } from '../theme';
import CategoryCard from '../components/CategoryCard';
import SavingsProgress from '../components/SavingsProgress';
import ExpenseModal from '../components/ExpenseModal';
import AchievementPopup from '../components/Confetti';
import Toast from '../components/Toast';

interface Stats {
  totalSpent: number;
  totalBudget: number;
  totalSaved: number;
  byCategory: Record<string, { spent: number; budget: number }>;
  byUser: Record<string, { name: string; color: string; spent: number }>;
}

export default function Dashboard() {
  const { user, currentMonth, currentYear, setMonth, refreshKey } = useApp();

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingAch, setPendingAch] = useState<{ key: string; name: string; icon: string; color: string } | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Array<{ key: string; name: string; icon: string; color: string }>>([]);
  const [toast, setToast] = useState({ visible: false, message: '' });

  useEffect(() => {
    setLoading(true);
    api.getStats(currentMonth, currentYear)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear, refreshKey]);

  function handleAchievements(achs: Array<{ key: string; name: string; icon: string; color: string }>) {
    if (achs.length > 0) {
      setAchievementQueue(achs.slice(1));
      setPendingAch(achs[0]);
    }
    setToast({ visible: true, message: 'הוצאה נרשמה בהצלחה!' });
  }

  function handleAchievementDone() {
    if (achievementQueue.length > 0) {
      setPendingAch(achievementQueue[0]);
      setAchievementQueue((q) => q.slice(1));
    } else {
      setPendingAch(null);
    }
  }

  const greetings = ['הולך מצוין! 💪', 'ממשיכים לחסוך! 🌟', 'ביחד מנצחים! 💑', 'כלכלה זה כיף! 🎉'];
  const greeting = greetings[currentMonth % greetings.length];

  const categories = stats
    ? Object.entries(stats.byCategory).sort((a, b) => {
        const pctA = a[1].budget > 0 ? a[1].spent / a[1].budget : 0;
        const pctB = b[1].budget > 0 ? b[1].spent / b[1].budget : 0;
        return pctB - pctA;
      })
    : [];

  return (
    <div className="pb-24">
      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={() => setToast({ visible: false, message: '' })}
        emoji="✅"
      />
      <AchievementPopup achievement={pendingAch} onDone={handleAchievementDone} />

      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #AB47BC 100%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-white/80 text-sm">שלום, {user?.name}! 👋</p>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={prevMonth}
                className="w-7 h-7 rounded-full bg-white/20 active:bg-white/40 flex items-center justify-center text-white text-lg leading-none"
              >
                ‹
              </button>
              <h1 className="text-xl font-black">{MONTH_NAMES[currentMonth]} {currentYear}</h1>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className="w-7 h-7 rounded-full bg-white/20 active:bg-white/40 flex items-center justify-center text-white text-lg leading-none disabled:opacity-30"
              >
                ›
              </button>
            </div>
            <p className="text-white/70 text-xs mt-0.5">{greeting}</p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg flex-shrink-0"
            style={{ background: user?.color || '#fff', color: 'white' }}
          >
            {user?.name?.[0]}
          </div>
        </div>

        {/* Total summary */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-white/70 text-xs">הוצאות החודש</p>
            <p className="text-xl font-black">{formatCurrency(stats?.totalSpent ?? 0)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-white/70 text-xs">תקציב כולל</p>
            <p className="text-xl font-black">{formatCurrency(stats?.totalBudget ?? 0)}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Savings */}
        {stats && (
          <SavingsProgress saved={stats.totalSaved} budget={stats.totalBudget} />
        )}

        {/* By user */}
        {stats && Object.keys(stats.byUser).length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-gray-700 text-sm mb-3">הוצאות לפי בן/בת זוג</p>
            <div className="space-y-2">
              {Object.values(stats.byUser).map((u) => (
                <div key={u.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: u.color }}
                  >
                    {u.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{u.name}</span>
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(u.spent)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: u.color }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${stats.totalSpent > 0 ? (u.spent / stats.totalSpent) * 100 : 0}%`,
                        }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div>
          <p className="font-bold text-gray-700 text-sm mb-3">קטגוריות</p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-medium">עוד אין תקציב להציג</p>
              <p className="text-sm">לכו לעמוד התקציב כדי להתחיל!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map(([cat, data], i) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CategoryCard
                    category={cat}
                    spent={data.spent}
                    budget={data.budget}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full text-white text-3xl shadow-2xl flex items-center justify-center z-30"
        style={{ background: 'linear-gradient(135deg, #6C63FF, #AB47BC)' }}
      >
        +
      </motion.button>

      <ExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleAchievements}
      />
    </div>
  );
}

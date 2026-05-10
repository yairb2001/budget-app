import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import AchievementBadge from '../components/AchievementBadge';
import { useApp } from '../context/AppContext';

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface UserAchievement {
  unlockedAt: string;
  achievement: Achievement;
}

export default function AchievementsPage() {
  const { refreshKey } = useApp();
  const [all, setAll] = useState<Achievement[]>([]);
  const [mine, setMine] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAchievements(), api.getMyAchievements()])
      .then(([allAchs, myAchs]) => {
        setAll(allAchs);
        setMine(myAchs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const unlockedKeys = new Set(mine.map((m) => m.achievement.key));
  const unlockedCount = unlockedKeys.size;
  const totalCount = all.length;
  const pct = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-8 text-white"
        style={{ background: 'linear-gradient(135deg, #FFA726 0%, #FF7043 100%)' }}
      >
        <h1 className="text-2xl font-black">הישגים 🏆</h1>
        <p className="text-white/70 text-sm mt-1">כמה רחוק הגעתם?</p>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between mb-2">
            <span className="text-white/80 text-sm font-medium">
              {unlockedCount} / {totalCount} הישגים
            </span>
            <span className="text-white font-bold">{Math.round(pct)}%</span>
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>

        {/* Fun message */}
        <div className="mt-4 text-center">
          {pct === 100 ? (
            <p className="text-white font-bold text-lg">אלופים מוחלטים! 🎉🎉🎉</p>
          ) : pct >= 50 ? (
            <p className="text-white/80 text-sm">מדהים! יותר מחצי הדרך!</p>
          ) : unlockedCount === 0 ? (
            <p className="text-white/80 text-sm">התחילו להזין הוצאות כדי לפתוח הישגים!</p>
          ) : (
            <p className="text-white/80 text-sm">ממשיכים קדימה, אתם מצוינים! 💪</p>
          )}
        </div>
      </div>

      {/* Unlocked */}
      {unlockedCount > 0 && (
        <div className="px-5 pt-5">
          <p className="font-bold text-gray-700 mb-3">✨ נפתחו</p>
          <div className="grid grid-cols-3 gap-3">
            {mine.map((ua, i) => (
              <motion.div
                key={ua.achievement.key}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 15 }}
              >
                <AchievementBadge
                  icon={ua.achievement.icon}
                  name={ua.achievement.name}
                  description={ua.achievement.description}
                  color={ua.achievement.color}
                  unlocked={true}
                  unlockedAt={ua.unlockedAt}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {all.filter((a) => !unlockedKeys.has(a.key)).length > 0 && (
        <div className="px-5 pt-5">
          <p className="font-bold text-gray-400 mb-3">🔒 עוד לא נפתחו</p>
          <div className="grid grid-cols-3 gap-3">
            {all
              .filter((a) => !unlockedKeys.has(a.key))
              .map((a, i) => (
                <motion.div
                  key={a.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <AchievementBadge
                    icon={a.icon}
                    name={a.name}
                    description={a.description}
                    color={a.color}
                    unlocked={false}
                  />
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="px-5 pt-5 grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}

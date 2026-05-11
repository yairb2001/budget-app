import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../api/client';
import { formatCurrency, MONTH_NAMES } from '../theme';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface MonthStat {
  month: number;
  year: number;
  totalSpent: number;
  totalBudget: number;
  totalSaved: number;
  hasData: boolean;
}

const SHORT_MONTHS = ['', 'ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

export default function OverviewPage() {
  const { setMonth } = useApp();
  const navigate = useNavigate();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<MonthStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (api as any).getYearStats(year)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const activeMonths = data.filter(m => m.hasData);
  const totalSavedYear = activeMonths.reduce((s, m) => s + m.totalSaved, 0);
  const totalSpentYear = activeMonths.reduce((s, m) => s + m.totalSpent, 0);
  const greenMonths = activeMonths.filter(m => m.totalBudget > 0 && m.totalSpent <= m.totalBudget).length;

  const chartData = data
    .filter(m => m.hasData)
    .map(m => ({
      name: SHORT_MONTHS[m.month],
      month: m.month,
      spent: Math.round(m.totalSpent),
      budget: Math.round(m.totalBudget),
    }));

  function goToMonth(m: MonthStat) {
    setMonth(m.month, m.year);
    navigate('/');
  }

  const maxYear = new Date().getFullYear();

  return (
    <div className="pb-24">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #AB47BC 100%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">סקירה שנתית</p>
            <h1 className="text-2xl font-black">📈 {year}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setYear(y => y - 1)}
              className="w-9 h-9 rounded-full bg-white/20 active:bg-white/40 flex items-center justify-center text-white text-xl font-bold"
            >
              ‹
            </button>
            <button
              onClick={() => setYear(y => Math.min(y + 1, maxYear))}
              disabled={year >= maxYear}
              className="w-9 h-9 rounded-full bg-white/20 active:bg-white/40 flex items-center justify-center text-white text-xl font-bold disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-white/70 text-[10px]">סה"כ הוצאות</p>
            <p className="text-base font-black">{formatCurrency(totalSpentYear)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-white/70 text-[10px]">חסכנו</p>
            <p className="text-base font-black">{formatCurrency(totalSavedYear)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-white/70 text-[10px]">חודשים ירוקים</p>
            <p className="text-base font-black">{greenMonths}/{activeMonths.length}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Bar Chart */}
        {loading ? (
          <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-5xl mb-3">📊</p>
            <p className="font-medium">אין נתונים לשנה זו</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <p className="font-bold text-gray-700 text-sm mb-4">הוצאות לעומת תקציב</p>
            <div dir="ltr">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number, name: string) => [formatCurrency(val), name === 'budget' ? 'תקציב' : 'הוצאות']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="budget" name="תקציב" fill="#E8E5FF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" name="הוצאות" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm bg-[#E8E5FF] inline-block" />תקציב
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm bg-[#6C63FF] inline-block" />הוצאות
              </span>
            </div>
          </motion.div>
        )}

        {/* Month table */}
        {!loading && activeMonths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-bold text-gray-700 text-sm">פירוט לפי חודש</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[...activeMonths].reverse().map((m) => {
                const pct = m.totalBudget > 0 ? m.totalSpent / m.totalBudget : 0;
                const isGreen = m.totalBudget > 0 && pct <= 1;
                const diff = Math.abs(m.totalSpent - m.totalBudget);
                return (
                  <button
                    key={`${m.year}-${m.month}`}
                    onClick={() => goToMonth(m)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-right"
                  >
                    <span className="text-xl flex-shrink-0">{isGreen ? '🌿' : '⚠️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{MONTH_NAMES[m.month]} {m.year}</p>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct * 100, 100)}%`,
                            background: isGreen ? '#4CAF50' : '#F44336',
                          }}
                        />
                      </div>
                    </div>
                    <div className={`text-sm font-bold flex-shrink-0 ${isGreen ? 'text-green-600' : 'text-red-500'}`}>
                      {isGreen ? `+${formatCurrency(diff)}` : `-${formatCurrency(diff)}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

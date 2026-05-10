import { motion } from 'framer-motion';
import { formatCurrency } from '../theme';

interface Props {
  saved: number;
  budget: number;
}

export default function SavingsProgress({ saved, budget }: Props) {
  const pct = budget > 0 ? Math.min((saved / budget) * 100, 100) : 0;
  const emoji = pct >= 100 ? '🎉' : pct >= 50 ? '🌟' : pct >= 20 ? '💪' : '🌱';

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="font-bold text-gray-800 text-sm">חסכנו החודש</p>
            <p className="text-xs text-gray-500">מתוך התקציב שנשאר</p>
          </div>
        </div>
        <div className="text-left">
          <p className="font-bold text-green-600 text-lg">{formatCurrency(saved)}</p>
          {budget > 0 && (
            <p className="text-xs text-gray-400">מתוך {formatCurrency(budget)}</p>
          )}
        </div>
      </div>

      <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #66BB6A, #43A047)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-green-600 font-medium">{Math.round(pct)}% מהתקציב</span>
        {pct >= 100 && (
          <span className="text-xs font-bold text-green-600">יעד הושג! 🏆</span>
        )}
      </div>
    </div>
  );
}

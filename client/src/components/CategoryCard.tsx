import { motion } from 'framer-motion';
import { getCategoryInfo, getProgressColor, formatCurrency } from '../theme';

interface Props {
  category: string;
  spent: number;
  budget: number;
  onClick?: () => void;
}

export default function CategoryCard({ category, spent, budget, onClick }: Props) {
  const info = getCategoryInfo(category);
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;
  const barColor = getProgressColor(budget > 0 ? (spent / budget) * 100 : 0);

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer select-none"
      style={{ background: info.bg, borderRight: `4px solid ${info.color}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info.icon}</span>
          <span className="font-bold text-gray-700 text-sm">{info.label}</span>
        </div>
        <div className="text-left">
          <span className="font-bold text-gray-800 text-sm">{formatCurrency(spent)}</span>
          {budget > 0 && (
            <span className="text-gray-400 text-xs"> / {formatCurrency(budget)}</span>
          )}
        </div>
      </div>

      {budget > 0 && (
        <>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs" style={{ color: barColor }}>
              {Math.round(pct)}%
            </span>
            {overBudget ? (
              <span className="text-xs font-bold text-red-500">
                חרגת ב-{formatCurrency(spent - budget)} 🚨
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                נותר {formatCurrency(budget - spent)}
              </span>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  achievement: { key: string; name: string; icon: string; color: string } | null;
  onDone: () => void;
}

const CONFETTI_COLORS = ['#6C63FF', '#FF6584', '#FFC107', '#4CAF50', '#42A5F5', '#AB47BC'];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function AchievementPopup({ achievement, onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (achievement) {
      timerRef.current = setTimeout(onDone, 3000);
    }
    return () => clearTimeout(timerRef.current);
  }, [achievement, onDone]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti particles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                top: '50%',
                left: '50%',
              }}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{
                x: randomBetween(-200, 200),
                y: randomBetween(-200, 200),
                scale: randomBetween(0.5, 1.5),
                rotate: randomBetween(0, 720),
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: i * 0.02 }}
            />
          ))}

          {/* Achievement card */}
          <motion.div
            className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-6 mx-8 text-center"
            style={{ borderTop: `6px solid ${achievement.color}` }}
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            onClick={onDone}
          >
            <motion.div
              className="text-6xl mb-3"
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {achievement.icon}
            </motion.div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: achievement.color }}>
              הישג חדש!
            </p>
            <p className="text-xl font-bold text-gray-800">{achievement.name}</p>
            <p className="text-sm text-gray-500 mt-1">הקשו להמשיך</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
  emoji?: string;
}

export default function Toast({ message, visible, onHide, emoji = '✅' }: Props) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-6 left-4 right-4 z-50 flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-xl"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <span className="text-xl">{emoji}</span>
          <p className="font-medium text-sm flex-1">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

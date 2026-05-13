import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PAYMENT_METHODS, getStoredIncomeCategories } from '../theme';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (newAchievements: Array<{ key: string; name: string; icon: string; color: string }>) => void;
}

export default function IncomeModal({ open, onClose, onSuccess }: Props) {
  const [cats, setCats] = useState(getStoredIncomeCategories());
  const [category, setCategory] = useState(cats[0]?.key ?? '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showSpark, setShowSpark] = useState(false);
  const { triggerRefresh } = useApp();

  useEffect(() => {
    if (open) {
      const updated = getStoredIncomeCategories();
      setCats(updated);
      setCategory(updated[0]?.key ?? '');
    }
  }, [open]);

  async function handleSubmit() {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const { newAchievements } = await (api as any).addIncome({
        category,
        amount: parseFloat(amount),
        description: description || undefined,
        paymentMethod,
      });
      setShowSpark(true);
      setTimeout(() => {
        setShowSpark(false);
        setAmount('');
        setDescription('');
        setCategory(cats[0]?.key ?? '');
        setPaymentMethod('cash');
        triggerRefresh();
        onSuccess(newAchievements);
        onClose();
      }, 700);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-8 shadow-2xl"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">רישום הכנסה 💰</h2>

            {/* Category */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {cats.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{ background: category === cat.key ? cat.bg : 'transparent', border: `2px solid ${category === cat.key ? cat.color : 'transparent'}` }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] text-gray-600 leading-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="relative mb-3">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₪</span>
              <input
                type="number" inputMode="decimal" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full text-center text-3xl font-bold bg-gray-50 rounded-2xl py-4 pr-10 outline-none focus:ring-2 focus:ring-green-300 transition"
                autoFocus
              />
            </div>

            {/* Description */}
            <input
              type="text" value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור (אופציונלי)"
              className="w-full bg-gray-50 rounded-2xl py-3 px-4 mb-4 outline-none focus:ring-2 focus:ring-green-300 transition text-gray-700"
            />

            {/* Payment method */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 mb-2">אמצעי תשלום:</p>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.key}
                    onClick={() => setPaymentMethod(pm.key)}
                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-xs font-medium"
                    style={{ background: paymentMethod === pm.key ? '#4CAF5015' : '#f5f5f5', border: `2px solid ${paymentMethod === pm.key ? '#4CAF50' : 'transparent'}`, color: paymentMethod === pm.key ? '#4CAF50' : '#666' }}
                  >
                    <span className="text-lg">{pm.icon}</span>
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="relative">
              {showSpark && (
                <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl z-10 pointer-events-none" initial={{ y: -10, opacity: 1, scale: 0 }} animate={{ y: -60, opacity: 0, scale: 1.2 }} transition={{ duration: 0.7 }}>
                  💸
                </motion.div>
              )}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit}
                disabled={loading || !amount}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #4CAF50, #2196F3)' }}
              >
                {loading ? '...' : 'שמור הכנסה ✓'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

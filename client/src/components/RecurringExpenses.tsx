import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { getStoredExpenseCategories, PAYMENT_METHODS, getCategoryInfo, getPaymentMethod, formatCurrency } from '../theme';
import { useApp } from '../context/AppContext';

interface RecurringItem {
  id: number;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  dayOfMonth: number;
  active: boolean;
}

export default function RecurringExpenses() {
  const { triggerRefresh } = useApp();
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const expCats = getStoredExpenseCategories();
  const [form, setForm] = useState({
    category: expCats[0]?.key ?? '',
    amount: '',
    description: '',
    paymentMethod: 'bank',
    dayOfMonth: '1',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api as any).getRecurring().then((data: RecurringItem[]) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  async function handleAdd() {
    if (!form.amount || !form.description) return;
    const item = await (api as any).addRecurring({
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description,
      paymentMethod: form.paymentMethod,
      dayOfMonth: parseInt(form.dayOfMonth) || 1,
    });
    setItems((prev) => [...prev, item]);
    setForm({ category: expCats[0]?.key ?? '', amount: '', description: '', paymentMethod: 'bank', dayOfMonth: '1' });
    setShowForm(false);
    triggerRefresh();
  }

  async function toggleActive(id: number, active: boolean) {
    await (api as any).updateRecurring(id, { active: !active });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, active: !active } : i));
    triggerRefresh();
  }

  async function handleDelete(id: number) {
    await (api as any).deleteRecurring(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    triggerRefresh();
  }

  const totalMonthly = items.filter(i => i.active).reduce((s, i) => s + i.amount, 0);

  // Group by category
  const grouped: Record<string, RecurringItem[]> = {};
  items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div className="px-5 pt-4">
      {/* Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 mb-5 flex items-center justify-between border border-indigo-100">
        <div>
          <p className="text-xs font-bold text-indigo-400 mb-0.5">סה"כ הוצאות קבועות</p>
          <p className="text-2xl font-black text-indigo-700">{formatCurrency(totalMonthly)}</p>
          <p className="text-xs text-indigo-400">בכל חודש אוטומטית</p>
        </div>
        <span className="text-4xl">🔄</span>
      </div>

      {/* List grouped by category */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catItems]) => {
            const info = getCategoryInfo(cat);
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{info.icon}</span>
                  <p className="text-sm font-bold text-gray-600">{info.label}</p>
                  <span className="text-xs text-gray-400">
                    ({formatCurrency(catItems.filter(i => i.active).reduce((s, i) => s + i.amount, 0))}/חודש)
                  </span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {catItems.map((item) => {
                      const pm = getPaymentMethod(item.paymentMethod);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: item.active ? 1 : 0.5, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3"
                          style={{ borderRight: `3px solid ${info.color}` }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-800 text-sm truncate">{item.description}</p>
                              {!item.active && (
                                <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">מושהה</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">יום {item.dayOfMonth} בחודש</span>
                              <span className="text-xs text-gray-300">·</span>
                              <span className="text-xs text-gray-400">{pm.icon} {pm.label}</span>
                            </div>
                          </div>
                          <p className="font-black text-gray-800 text-sm">{formatCurrency(item.amount)}</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleActive(item.id, item.active)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                              style={{ background: item.active ? '#4CAF5020' : '#f5f5f5' }}
                              title={item.active ? 'השהה' : 'הפעל'}
                            >
                              {item.active ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 transition text-lg"
                            >
                              ×
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowForm(true)}
        className="w-full mt-5 py-4 rounded-2xl font-bold text-indigo-600 border-2 border-dashed border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span> הוסף הוצאה קבועה
      </motion.button>

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h3 className="text-lg font-bold text-center text-gray-800 mb-5">הוצאה קבועה חדשה 📌</h3>

              {/* Category */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {expCats.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setForm(f => ({ ...f, category: cat.key }))}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                    style={{
                      background: form.category === cat.key ? cat.bg : 'transparent',
                      border: `2px solid ${form.category === cat.key ? cat.color : 'transparent'}`,
                    }}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] text-gray-600 text-center leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Description */}
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="שם ההוצאה (שכר דירה, ביטוח...)"
                className="w-full bg-gray-50 rounded-2xl py-3 px-4 mb-3 outline-none focus:ring-2 focus:ring-purple-300 transition"
                autoFocus
              />

              {/* Amount + Day */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₪</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="סכום"
                    className="w-full bg-gray-50 rounded-2xl py-3 pr-8 pl-3 outline-none focus:ring-2 focus:ring-purple-300 transition font-bold"
                  />
                </div>
                <div className="relative w-28">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">יום</span>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={form.dayOfMonth}
                    onChange={(e) => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
                    className="w-full bg-gray-50 rounded-2xl py-3 pr-10 pl-3 outline-none focus:ring-2 focus:ring-purple-300 transition font-bold"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 mb-2">אמצעי תשלום:</p>
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.key}
                      onClick={() => setForm(f => ({ ...f, paymentMethod: pm.key }))}
                      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-xs font-medium"
                      style={{
                        background: form.paymentMethod === pm.key ? '#6C63FF15' : '#f5f5f5',
                        border: `2px solid ${form.paymentMethod === pm.key ? '#6C63FF' : 'transparent'}`,
                        color: form.paymentMethod === pm.key ? '#6C63FF' : '#666',
                      }}
                    >
                      <span className="text-lg">{pm.icon}</span>
                      <span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={!form.amount || !form.description}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #AB47BC)' }}
              >
                הוסף הוצאה קבועה 📌
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

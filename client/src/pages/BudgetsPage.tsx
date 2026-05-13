import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { getStoredExpenseCategories, getStoredIncomeCategories, saveExpenseCategories, saveIncomeCategories, formatCurrency, MONTH_NAMES, Category } from '../theme';
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';
import RecurringExpenses from '../components/RecurringExpenses';

interface Budget { id: number; category: string; amount: number; month: number; year: number; }

const PRESET_ICONS = ['✂️','👥','🏠','📣','⚡','📦','💊','🛒','📱','🚗','🎓','💺','🛍️','🔧','💰','📊'];
const PRESET_COLORS = ['#FF7043','#42A5F5','#26A69A','#AB47BC','#FFA726','#78909C','#4CAF50','#EC407A','#2196F3','#FF9800','#9C27B0','#FF5722','#607D8B','#F44336','#00BCD4'];

export default function BudgetsPage() {
  const { currentMonth, currentYear, triggerRefresh } = useApp();
  const [tab, setTab] = useState<'budget' | 'recurring' | 'categories'>('budget');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Category editing state
  const [expCats, setExpCats] = useState<Category[]>(getStoredExpenseCategories());
  const [incCats, setIncCats] = useState<Category[]>(getStoredIncomeCategories());
  const [catTab, setCatTab] = useState<'expense' | 'income'>('expense');
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ label: '', icon: '📦', color: '#78909C', bg: '#F5F7F8', type: 'expense' as 'expense' | 'income' });

  useEffect(() => {
    setLoading(true);
    api.getBudgets(currentMonth, currentYear).then(setBudgets as any).catch(console.error).finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  async function saveBudget(category: string) {
    const amount = parseFloat(editValue);
    if (isNaN(amount) || amount < 0) return;
    await api.upsertBudget(category, amount, currentMonth, currentYear);
    const updated = await api.getBudgets(currentMonth, currentYear);
    setBudgets(updated as Budget[]);
    triggerRefresh();
    setEditing(null);
    setToast({ visible: true, message: `תקציב עודכן ל-${formatCurrency(amount)}` });
  }

  function addCategory() {
    if (!catForm.label.trim()) return;
    const newCat: Category = { key: catForm.label.trim(), icon: catForm.icon, color: catForm.color, bg: catForm.bg || '#F5F7F8', label: catForm.label.trim() };
    if (catForm.type === 'expense') {
      const updated = [...expCats, newCat];
      setExpCats(updated);
      saveExpenseCategories(updated);
    } else {
      const updated = [...incCats, newCat];
      setIncCats(updated);
      saveIncomeCategories(updated);
    }
    setShowCatForm(false);
    setCatForm({ label: '', icon: '📦', color: '#78909C', bg: '#F5F7F8', type: catTab });
    setToast({ visible: true, message: 'קטגוריה נוספה!' });
  }

  function deleteCategory(type: 'expense' | 'income', key: string) {
    if (!confirm(`למחוק את הקטגוריה "${key}"?`)) return;
    if (type === 'expense') {
      const updated = expCats.filter(c => c.key !== key);
      setExpCats(updated);
      saveExpenseCategories(updated);
    } else {
      const updated = incCats.filter(c => c.key !== key);
      setIncCats(updated);
      saveIncomeCategories(updated);
    }
    setToast({ visible: true, message: 'קטגוריה נמחקה' });
  }

  const total = budgets.reduce((s, b) => s + b.amount, 0);
  const gradients: Record<string, string> = {
    budget: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
    recurring: 'linear-gradient(135deg, #6C63FF 0%, #AB47BC 100%)',
    categories: 'linear-gradient(135deg, #FF7043 0%, #FFA726 100%)',
  };

  return (
    <div className="pb-24">
      <Toast visible={toast.visible} message={toast.message} onHide={() => setToast({ visible: false, message: '' })} emoji="💾" />

      {/* Header */}
      <div className="px-5 pt-12 pb-6 text-white" style={{ background: gradients[tab] }}>
        <h1 className="text-2xl font-black">
          {tab === 'budget' ? 'תקציב חודשי 📋' : tab === 'recurring' ? 'הוצאות קבועות 📌' : 'ניהול קטגוריות 🗂️'}
        </h1>
        <p className="text-white/70 text-sm mt-1">{MONTH_NAMES[currentMonth]} {currentYear}</p>
        {tab === 'budget' && (
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 mt-4 text-center">
            <p className="text-white/70 text-xs">סה"כ תקציב</p>
            <p className="text-2xl font-black">{formatCurrency(total)}</p>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex mx-5 mt-4 bg-gray-100 rounded-2xl p-1 gap-1">
        {([
          { key: 'budget',     label: '📋 תקציב' },
          { key: 'recurring',  label: '📌 קבועות' },
          { key: 'categories', label: '🗂️ קטגוריות' },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#1A1A2E' : '#999', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* ── Budget tab ── */}
        {tab === 'budget' && (
          <motion.div key="budget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-5 pt-4 space-y-3">
            <p className="text-sm text-gray-500 font-medium">הקש על קטגוריה לעריכת התקציב</p>
            {expCats.map((cat, i) => {
              const budget = budgets.find((b) => b.category === cat.key);
              const isEditing = editing === cat.key;
              return (
                <motion.div key={cat.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ borderRight: `4px solid ${cat.color}` }}>
                  <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => { if (!isEditing) { setEditing(cat.key); setEditValue(String(budget?.amount ?? '')); } else setEditing(null); }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: cat.bg }}>{cat.icon}</div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{cat.label}</p>
                        {budget ? <p className="text-xs text-gray-500">{formatCurrency(budget.amount)} לחודש</p> : <p className="text-xs text-gray-400">לא הוגדר</p>}
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg">{isEditing ? '✕' : '✏️'}</span>
                  </div>
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₪</span>
                            <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="0" autoFocus
                              className="w-full bg-gray-50 rounded-xl py-3 pr-8 pl-3 outline-none focus:ring-2 transition font-bold text-gray-800"
                              onKeyDown={(e) => { if (e.key === 'Enter') saveBudget(cat.key); if (e.key === 'Escape') setEditing(null); }}
                            />
                          </div>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => saveBudget(cat.key)} className="px-5 rounded-xl text-white font-bold text-sm" style={{ background: cat.color }}>שמור</motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Recurring tab ── */}
        {tab === 'recurring' && (
          <motion.div key="recurring" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <RecurringExpenses />
          </motion.div>
        )}

        {/* ── Categories tab ── */}
        {tab === 'categories' && (
          <motion.div key="categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-5 pt-4">
            {/* Sub-tabs */}
            <div className="flex bg-gray-100 rounded-2xl p-1 gap-1 mb-4">
              {([{ key: 'expense', label: '📊 הוצאות' }, { key: 'income', label: '💰 הכנסות' }] as const).map(t => (
                <button key={t.key} onClick={() => setCatTab(t.key)} className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: catTab === t.key ? 'white' : 'transparent', color: catTab === t.key ? '#1A1A2E' : '#999', boxShadow: catTab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Category list */}
            <div className="space-y-2 mb-4">
              {(catTab === 'expense' ? expCats : incCats).map((cat, i) => (
                <motion.div key={cat.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3" style={{ borderRight: `4px solid ${cat.color}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: cat.bg }}>{cat.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm">{cat.label}</p>
                  </div>
                  <button onClick={() => deleteCategory(catTab, cat.key)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 transition text-lg">×</button>
                </motion.div>
              ))}
            </div>

            {/* Add category button */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowCatForm(true); setCatForm(f => ({ ...f, type: catTab })); }}
              className="w-full py-4 rounded-2xl font-bold border-2 border-dashed border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100 transition flex items-center justify-center gap-2">
              <span className="text-xl">+</span> הוסף קטגוריה חדשה
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add category modal */}
      <AnimatePresence>
        {showCatForm && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCatForm(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h3 className="text-lg font-bold text-center text-gray-800 mb-5">
                קטגוריה חדשה — {catForm.type === 'expense' ? 'הוצאה' : 'הכנסה'}
              </h3>

              {/* Name */}
              <input type="text" value={catForm.label} onChange={e => setCatForm(f => ({ ...f, label: e.target.value }))} placeholder="שם הקטגוריה" autoFocus
                className="w-full bg-gray-50 rounded-2xl py-3 px-4 mb-4 outline-none focus:ring-2 focus:ring-orange-300 transition text-gray-700 font-bold" />

              {/* Icon picker */}
              <p className="text-xs font-bold text-gray-500 mb-2">אייקון:</p>
              <div className="grid grid-cols-8 gap-2 mb-4">
                {PRESET_ICONS.map(icon => (
                  <button key={icon} onClick={() => setCatForm(f => ({ ...f, icon }))}
                    className="w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all"
                    style={{ background: catForm.icon === icon ? '#FFF3F0' : '#f5f5f5', border: `2px solid ${catForm.icon === icon ? '#FF7043' : 'transparent'}` }}>
                    {icon}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <p className="text-xs font-bold text-gray-500 mb-2">צבע:</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {PRESET_COLORS.map(color => (
                  <button key={color} onClick={() => setCatForm(f => ({ ...f, color, bg: color + '15' }))}
                    className="w-8 h-8 rounded-full transition-transform"
                    style={{ background: color, border: `3px solid ${catForm.color === color ? '#1A1A2E' : 'transparent'}`, transform: catForm.color === color ? 'scale(1.2)' : 'scale(1)' }} />
                ))}
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: catForm.color + '20' }}>{catForm.icon}</div>
                <p className="font-bold text-gray-800">{catForm.label || 'שם הקטגוריה'}</p>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={addCategory} disabled={!catForm.label.trim()}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #FF7043, #FFA726)' }}>
                הוסף קטגוריה ✓
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

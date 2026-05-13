import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const COLORS = [
  '#6C63FF', '#FF6584', '#4CAF50', '#FF7043',
  '#2196F3', '#FF9800', '#9C27B0', '#00BCD4',
  '#E91E63', '#1A1A2E', '#26A69A', '#F44336',
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useApp();

  async function handleSubmit() {
    if (!name.trim() || !password) return;
    if (mode === 'register') {
      if (password !== confirmPassword) { setError('הסיסמאות אינן תואמות'); return; }
      if (password.length < 4) { setError('סיסמה חייבת להכיל לפחות 4 תווים'); return; }
      if (name.trim().length < 2) { setError('שם חייב להכיל לפחות 2 תווים'); return; }
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(name.trim(), password);
      } else {
        await register(name.trim(), password, selectedColor);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: 'login' | 'register') {
    setMode(m);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)' }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div className="text-6xl mb-3" animate={{ rotate: [0, -3, 3, -2, 2, 0] }} transition={{ duration: 1.2, delay: 0.5 }}>
            ✂️
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">DOMINANT</h1>
          <p className="text-white/50 text-sm tracking-widest uppercase mt-1">Barbers & Academy</p>
          <div className="w-16 h-0.5 bg-white/20 mx-auto mt-3" />
        </div>

        {/* Mode toggle */}
        <div className="flex bg-white/10 rounded-2xl p-1 mb-5 gap-1">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: mode === m ? 'white' : 'transparent', color: mode === m ? '#1A1A2E' : 'rgba(255,255,255,0.5)' }}>
              {m === 'login' ? 'כניסה' : 'הרשמה'}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: mode === 'register' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="space-y-3">

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">שם משתמש</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={mode === 'login' ? 'יאיר / מנהל' : 'השם שיוצג'}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/30 transition"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">סיסמה</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/30 transition"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>

              {/* Register-only fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-white/50 mb-1 block">אימות סיסמה</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/30 transition"
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/50 mb-2 block">צבע אישי (לאוואטאר)</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button key={color} onClick={() => setSelectedColor(color)}
                          className="w-8 h-8 rounded-full transition-all"
                          style={{ background: color, border: `3px solid ${selectedColor === color ? 'white' : 'transparent'}`, transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)' }} />
                      ))}
                    </div>
                    {/* Preview */}
                    <div className="flex items-center gap-3 mt-3 bg-white/5 rounded-xl p-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: selectedColor }}>
                        {name ? name[0].toUpperCase() : '?'}
                      </div>
                      <p className="text-white/70 text-sm">{name || 'שם משתמש'}</p>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                  {error}
                </motion.p>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading || !name || !password}
                className="w-full py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all mt-2"
                style={{ background: mode === 'login' ? 'linear-gradient(135deg, #4CAF50, #2196F3)' : 'linear-gradient(135deg, #6C63FF, #AB47BC)', color: 'white' }}>
                {loading ? '...' : mode === 'login' ? 'כניסה →' : 'פתח חשבון ✨'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {mode === 'login' && (
          <p className="text-center text-xs text-white/25 mt-4">
            ברירת מחדל: שם = יאיר, סיסמה = 1234
          </p>
        )}
      </motion.div>
    </div>
  );
}

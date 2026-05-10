import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useApp();

  async function handleLogin() {
    if (!name || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(name, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="text-7xl mb-3"
            animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            💰
          </motion.div>
          <h1 className="text-3xl font-black text-gray-800">כספינו</h1>
          <p className="text-gray-500 mt-1">ניהול כספי משפחתי — ביחד</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">כניסה לחשבון</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">שם</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="יאיר / אשתי"
                className="w-full bg-gray-50 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-300 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-gray-50 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-300 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg mt-5 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #AB47BC)' }}
          >
            {loading ? '...' : 'כניסה ✨'}
          </motion.button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          ברירת מחדל: שם = יאיר, סיסמה = 1234
        </p>
      </motion.div>
    </div>
  );
}

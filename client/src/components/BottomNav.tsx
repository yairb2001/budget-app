import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const TABS = [
  { to: '/', icon: '🏠', label: 'ראשי' },
  { to: '/budgets', icon: '📋', label: 'תקציב' },
  { to: '/expenses', icon: '📊', label: 'הוצאות' },
  { to: '/achievements', icon: '🏆', label: 'הישגים' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg pb-safe">
      <div className="flex items-center justify-around py-2">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span
                  className="text-2xl leading-none"
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {tab.icon}
                </motion.span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 w-12 h-0.5 bg-purple-600 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

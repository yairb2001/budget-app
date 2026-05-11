import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import BudgetsPage from './pages/BudgetsPage';
import ExpensesPage from './pages/ExpensesPage';
import AchievementsPage from './pages/AchievementsPage';
import OverviewPage from './pages/OverviewPage';
import LoginPage from './pages/LoginPage';

function AppRoutes() {
  const { user } = useApp();

  if (!user) return <LoginPage />;

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

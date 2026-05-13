import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';

interface User {
  id: number;
  name: string;
  color: string;
}

interface Achievement {
  key: string;
  name: string;
  icon: string;
  color: string;
}

interface AppContextType {
  user: User | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string, color: string) => Promise<void>;
  logout: () => void;
  currentMonth: number;
  currentYear: number;
  setMonth: (m: number, y: number) => void;
  pendingAchievements: Achievement[];
  addPendingAchievements: (a: Achievement[]) => void;
  clearPendingAchievements: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const login = useCallback(async (name: string, password: string) => {
    const { token, user } = await api.login(name, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, password: string, color: string) => {
    const { token, user } = await (api as any).register(name, password, color);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const setMonth = useCallback((m: number, y: number) => {
    setCurrentMonth(m);
    setCurrentYear(y);
  }, []);

  const addPendingAchievements = useCallback((a: Achievement[]) => {
    setPendingAchievements((prev) => [...prev, ...a]);
  }, []);

  const clearPendingAchievements = useCallback(() => {
    setPendingAchievements([]);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        currentMonth,
        currentYear,
        setMonth,
        pendingAchievements,
        addPendingAchievements,
        clearPendingAchievements,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

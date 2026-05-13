import { mockApi } from './mockClient';

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const BASE = '/api';
function getToken() { return localStorage.getItem('token') || ''; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה' }));
    throw new Error(err.error || 'שגיאה בשרת');
  }
  return res.json();
}

const realApi = {
  login: (name: string, password: string) =>
    request<{ token: string; user: { id: number; name: string; color: string } }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ name, password }),
    }),

  register: (name: string, password: string, color: string) =>
    request<{ token: string; user: { id: number; name: string; color: string } }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, password, color }),
    }),

  getStats: (month: number, year: number) =>
    request<any>(`/stats/monthly?month=${month}&year=${year}`),

  getBudgets: (month: number, year: number) =>
    request<any[]>(`/budgets?month=${month}&year=${year}`),

  upsertBudget: (category: string, amount: number, month: number, year: number) =>
    request('/budgets', { method: 'POST', body: JSON.stringify({ category, amount, month, year }) }),

  deleteBudget: (id: number) => request(`/budgets/${id}`, { method: 'DELETE' }),

  getExpenses: (month: number, year: number, category?: string) =>
    request<any[]>(`/expenses?month=${month}&year=${year}${category ? `&category=${category}` : ''}`),

  addExpense: (data: { category: string; amount: number; description?: string; paymentMethod?: string; date?: string }) =>
    request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  deleteExpense: (id: number) => request(`/expenses/${id}`, { method: 'DELETE' }),

  getYearStats: (year: number) => request<any[]>(`/stats/yearly?year=${year}`),

  getIncome: (month: number, year: number, category?: string) =>
    request<any[]>(`/income?month=${month}&year=${year}${category ? `&category=${category}` : ''}`),
  addIncome: (data: any) => request<any>('/income', { method: 'POST', body: JSON.stringify(data) }),
  deleteIncome: (id: number) => request(`/income/${id}`, { method: 'DELETE' }),

  getExpenseCategories: () => request<any[]>('/categories/expenses'),
  getIncomeCategories:  () => request<any[]>('/categories/income'),
  saveExpenseCategories: (cats: any[]) => request('/categories/expenses', { method: 'PUT', body: JSON.stringify(cats) }),
  saveIncomeCategories:  (cats: any[]) => request('/categories/income',   { method: 'PUT', body: JSON.stringify(cats) }),

  getAchievements: () => request<any[]>('/achievements'),
  getMyAchievements: () => request<any[]>('/achievements/mine'),

  getRecurring: () => request<any[]>('/recurring'),
  addRecurring: (data: any) => request('/recurring', { method: 'POST', body: JSON.stringify(data) }),
  updateRecurring: (id: number, data: any) => request(`/recurring/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecurring: (id: number) => request(`/recurring/${id}`, { method: 'DELETE' }),
};

export const api = DEMO ? mockApi : realApi;

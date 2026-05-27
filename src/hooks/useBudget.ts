import { useState, useEffect } from 'react';
import type { BudgetState, Expense } from '../types';

const STORAGE_KEY = 'budget-rpg-v2';

const DEFAULT_STATE: BudgetState = {
  totalBudget: 30000,
  expenses: [],
};

function loadState(): BudgetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_STATE;
}

export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export const toDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const monthPrefix = (year: number, month: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

export function useBudget() {
  const [state, setState] = useState<BudgetState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const { totalBudget, expenses } = state;

  const today = new Date();
  const todayStr = toDateStr(today);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();   // 0-indexed
  const currentDay = today.getDate();
  const totalDays = daysInMonth(currentYear, currentMonth);

  const prefix = monthPrefix(currentYear, currentMonth);

  // Expenses in this month logged before today
  const totalSpentBefore = expenses
    .filter((e) => e.date.startsWith(prefix) && e.date < todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const remainingDaysIncludingToday = Math.max(1, totalDays - currentDay + 1);
  const todayBudget = (totalBudget - totalSpentBefore) / remainingDaysIncludingToday;
  const todayRemaining = todayBudget - todaySpent;

  const totalSpentNow = totalSpentBefore + todaySpent;
  const remainingDaysExcludingToday = totalDays - currentDay;
  const tomorrowBudget =
    remainingDaysExcludingToday > 0
      ? (totalBudget - totalSpentNow) / remainingDaysExcludingToday
      : 0;

  const buff = tomorrowBudget - todayBudget;
  const buffPercent = todayBudget > 0 ? (buff / todayBudget) * 100 : 0;

  const addExpense = (amount: number, memo: string) => {
    const expense: Expense = {
      id: crypto.randomUUID(),
      date: todayStr,
      amount,
      memo: memo || '（メモなし）',
      timestamp: Date.now(),
    };
    setState((s) => ({ ...s, expenses: [...s.expenses, expense] }));
  };

  const removeExpense = (id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  };



  const updateSettings = (budget: number) => {
    setState((s) => ({ ...s, totalBudget: budget }));
  };

  const resetAll = () => setState(DEFAULT_STATE);

  return {
    totalBudget,
    totalDays,
    currentYear,
    currentMonth,
    currentDay,
    todayStr,
    expenses,
    todayExpenses,
    todayBudget,
    todaySpent,
    todayRemaining,
    tomorrowBudget,
    buff,
    buffPercent,
    totalSpentNow,
    addExpense,
    removeExpense,
    updateSettings,
    resetAll,
  };
}

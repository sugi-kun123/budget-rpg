import { useState, useEffect } from 'react';
import type { BudgetState, Expense } from '../types';

const STORAGE_KEY = 'budget-rpg-v1';

const DEFAULT_STATE: BudgetState = {
  totalBudget: 30000,
  totalDays: 30,
  currentDay: 1,
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

export function useBudget() {
  const [state, setState] = useState<BudgetState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const { totalBudget, totalDays, currentDay, expenses } = state;

  // Sum of expenses from days before today
  const totalSpentBefore = expenses
    .filter((e) => e.day < currentDay)
    .reduce((sum, e) => sum + e.amount, 0);

  const todayExpenses = expenses.filter((e) => e.day === currentDay);
  const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Today's budget is calculated once at the start of the day (before today's spending)
  const remainingDaysIncludingToday = Math.max(1, totalDays - currentDay + 1);
  const todayBudget = (totalBudget - totalSpentBefore) / remainingDaysIncludingToday;
  const todayRemaining = todayBudget - todaySpent;

  // Tomorrow's budget if no more spending happens today
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
      day: currentDay,
      amount,
      memo: memo || '（メモなし）',
      timestamp: Date.now(),
    };
    setState((s) => ({ ...s, expenses: [...s.expenses, expense] }));
  };

  const removeExpense = (id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  };

  const advanceDay = () => {
    setState((s) => ({
      ...s,
      currentDay: Math.min(s.currentDay + 1, s.totalDays),
    }));
  };

  const updateSettings = (budget: number, days: number) => {
    setState((s) => ({ ...s, totalBudget: budget, totalDays: days }));
  };

  const resetAll = () => setState(DEFAULT_STATE);

  return {
    totalBudget,
    totalDays,
    currentDay,
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
    advanceDay,
    updateSettings,
    resetAll,
  };
}

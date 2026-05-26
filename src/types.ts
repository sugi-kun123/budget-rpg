export interface Expense {
  id: string;
  day: number;
  amount: number;
  memo: string;
  timestamp: number;
}

export interface BudgetState {
  totalBudget: number;
  totalDays: number;
  currentDay: number;
  expenses: Expense[];
}

export interface Expense {
  id: string;
  date: string;   // "YYYY-MM-DD"
  amount: number;
  memo: string;
  timestamp: number;
}

export interface BudgetState {
  totalBudget: number;
  expenses: Expense[];
}

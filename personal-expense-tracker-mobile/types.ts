export enum Category {
  Food = "Food",
  Travel = "Travel",
  Bills = "Bills",
  Entertainment = "Entertainment",
  Shopping = "Shopping",
  Health = "Health",
  Other = "Other",
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO string format
  notes: string;
  receiptUrl?: string;
}

export interface AppState {
  expenses: Expense[];
  budget: number;
}

export type AppAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_BUDGET'; payload: number }
  | { type: 'SET_STATE'; payload: AppState } // For loading data
  | { type: 'CLEAR_STATE' }; // For signing out

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setBudget: (amount: number) => void;
}

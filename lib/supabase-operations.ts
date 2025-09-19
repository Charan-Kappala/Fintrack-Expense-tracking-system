import { supabase } from './supabase';
import { AppState, Expense } from '../types';

export const saveUserDataToSupabase = async (userId: string, data: AppState): Promise<void> => {
  try {
    // Save budget
    if (data.budget > 0) {
      const { error: budgetError } = await supabase
        .from('budgets')
        .upsert({
          user_id: userId,
          amount: data.budget
        });

      if (budgetError) {
        console.error('Error saving budget to Supabase:', budgetError);
        return;
      }
    }

    // Save expenses
    if (data.expenses.length > 0) {
      for (const expense of data.expenses) {
        // For new expenses (string IDs from timestamp), let Supabase generate UUID
        const expenseData: any = {
          user_id: userId,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          notes: expense.notes,
          receiptUrl: expense.receiptUrl
        };
        
        // Only include ID if it looks like a UUID (not a timestamp string)
        if (expense.id.includes('-')) {
          expenseData.id = expense.id;
        }

        const { error: expenseError } = await supabase
          .from('expenses')
          .upsert(expenseData);

        if (expenseError) {
          console.error('Error saving expense to Supabase:', expenseError);
        }
      }
    }
  } catch (error) {
    console.error('Error saving data to Supabase:', error);
  }
};

export const loadUserDataFromSupabase = async (userId: string): Promise<AppState | null> => {
  try {
    // Load budget
    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .select('amount')
      .eq('user_id', userId)
      .single();

    // Load expenses
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (budgetError && budgetError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading budget from Supabase:', budgetError);
    }

    if (expensesError) {
      console.error('Error loading expenses from Supabase:', expensesError);
      return null;
    }

    const expenses: Expense[] = (expensesData || []).map(expense => ({
      id: expense.id,
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date,
      notes: expense.notes,
      receiptUrl: expense.receiptUrl
    }));

    return {
      budget: budgetData?.amount ? parseFloat(budgetData.amount) : 0,
      expenses
    };
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    return null;
  }
};

export const deleteExpenseFromSupabase = async (userId: string, expenseId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting expense from Supabase:', error);
    }
  } catch (error) {
    console.error('Error deleting expense from Supabase:', error);
  }
};
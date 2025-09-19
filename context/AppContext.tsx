import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { AppState, AppAction, AppContextType, Expense, Category } from '../types';
import { useAuth } from './AuthContext';
import { loadUserDataFromSupabase, saveUserDataToSupabase, deleteExpenseFromSupabase } from '../lib/supabase-operations';

// Default state for new users
const defaultUserState: AppState = {
  expenses: [],
  budget: 0, // No budget set initially
};

const emptyState: AppState = {
    expenses: [],
    budget: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'SET_BUDGET':
      return {
        ...state,
        budget: action.payload,
      };
    case 'SET_STATE':
        return action.payload;
    case 'CLEAR_STATE':
        return emptyState;
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, emptyState);
  const { isSignedIn, user } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // Load user data from localStorage
  const loadUserData = (userId: string): AppState => {
    try {
      const savedData = localStorage.getItem(`expense-tracker-${userId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Validate the data structure
        if (parsedData && typeof parsedData.budget === 'number' && Array.isArray(parsedData.expenses)) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
    }
    // Return default state if no saved data or error
    return { ...defaultUserState };
  };

  // Save user data to localStorage
  const saveUserData = (userId: string, data: AppState) => {
    try {
      localStorage.setItem(`expense-tracker-${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  };

  // Load user data when user signs in
  useEffect(() => {
    const loadData = async () => {
      if (isSignedIn && user && !isLoadingRef.current) {
        isLoadingRef.current = true;
        console.log('Loading data for user:', user.id);
        
        // Load from localStorage first (faster and more reliable)
        const localData = loadUserData(user.id);
        console.log('Loaded local data:', localData);
        dispatch({ type: 'SET_STATE', payload: localData });
        
        // Then try to load from Supabase and merge
        try {
          const supabaseData = await loadUserDataFromSupabase(user.id);
          if (supabaseData && (supabaseData.expenses.length > 0 || supabaseData.budget > 0)) {
            console.log('Loaded Supabase data:', supabaseData);
            dispatch({ type: 'SET_STATE', payload: supabaseData });
            // Update localStorage with the latest data from Supabase
            saveUserData(user.id, supabaseData);
          }
        } catch (error) {
          console.error('Failed to load from Supabase, using localStorage:', error);
        }
        
        isLoadingRef.current = false;
      } else if (!isSignedIn) {
        console.log('User signed out, clearing state');
        dispatch({ type: 'CLEAR_STATE' });
        isLoadingRef.current = false;
      }
    };
    
    loadData();
  }, [isSignedIn, user]);

  // Save data whenever state changes (but only if user is signed in)
  useEffect(() => {
    if (isSignedIn && user && !isLoadingRef.current) {
      console.log('Saving state for user:', user.id, state);
      
      // Always save to localStorage immediately
      saveUserData(user.id, state);
      
      // Debounced save to Supabase (to avoid too many API calls)
      if (state.expenses.length > 0 || state.budget > 0) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(async () => {
          console.log('Saving to Supabase:', state);
          try {
            await saveUserDataToSupabase(user.id, state);
          } catch (error) {
            console.error('Failed to save to Supabase:', error);
          }
        }, 2000); // Wait 2 seconds before saving to Supabase
      }
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, isSignedIn, user]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: new Date().getTime().toString() };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = (expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const deleteExpense = async (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    
    // Also delete from Supabase if user is signed in
    if (isSignedIn && user) {
      await deleteExpenseFromSupabase(user.id, id);
    }
  };

  const setBudget = (amount: number) => {
    dispatch({ type: 'SET_BUDGET', payload: amount });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addExpense, updateExpense, deleteExpense, setBudget }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
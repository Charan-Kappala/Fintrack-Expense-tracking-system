
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { AlertTriangleIcon } from './icons';

const BudgetTracker: React.FC = () => {
  const { state, setBudget } = useAppContext();
  const { expenses, budget } = state;
  const [newBudget, setNewBudget] = useState(budget.toString());
  const [isEditing, setIsEditing] = useState(false);

  const totalExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBudget = budget - totalExpenses;
  const budgetUsagePercentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;

  useEffect(() => {
    setNewBudget(budget.toString());
  }, [budget]);

  const handleBudgetSave = () => {
    const amount = parseFloat(newBudget);
    if (!isNaN(amount) && amount >= 0) {
      setBudget(amount);
      setIsEditing(false);
    }
  };

  const getProgressBarColor = () => {
    if (budgetUsagePercentage > 80) return 'bg-danger';
    if (budgetUsagePercentage > 50) return 'bg-accent';
    return 'bg-secondary';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Monthly Budget</h2>
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">$</span>
            <input 
              type="number" 
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="w-32 p-1 border rounded-md"
              onBlur={handleBudgetSave}
              onKeyPress={(e) => e.key === 'Enter' && handleBudgetSave()}
              placeholder="1000"
            />
            <button onClick={handleBudgetSave} className="px-3 py-1 bg-primary text-white rounded-md text-sm">Save</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className={`text-lg font-semibold ${budget === 0 ? 'text-gray-500 border-2 border-dashed border-gray-300 px-3 py-1 rounded-md hover:border-gray-400' : 'text-primary'}`}>
            {budget === 0 ? 'Set Budget' : `$${budget.toLocaleString()}`}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="w-full bg-base-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-xl font-semibold text-gray-800">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className={`text-xl font-semibold ${remainingBudget < 0 ? 'text-danger' : 'text-secondary'}`}>
              ${remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
           <div>
            <p className="text-sm text-gray-500">Usage</p>
            <p className="text-xl font-semibold text-gray-800">{budgetUsagePercentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      {budgetUsagePercentage > 80 && (
        <div className="mt-4 p-3 bg-red-100 border-l-4 border-danger text-red-700 rounded-md flex items-center">
          <AlertTriangleIcon className="w-5 h-5 mr-3" />
          <p>You've used over 80% of your budget this month!</p>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;

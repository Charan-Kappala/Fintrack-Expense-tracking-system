
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Expense, Category } from '../types';
import { EditIcon, TrashIcon } from './icons';

interface ExpenseListProps {
  onEdit: (expense: Expense) => void;
}

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  const categoryStyles: { [key in Category]: string } = {
    [Category.Food]: 'bg-green-100 text-green-800',
    [Category.Travel]: 'bg-blue-100 text-blue-800',
    [Category.Bills]: 'bg-orange-100 text-orange-800',
    [Category.Entertainment]: 'bg-purple-100 text-purple-800',
    [Category.Shopping]: 'bg-pink-100 text-pink-800',
    [Category.Health]: 'bg-amber-100 text-amber-800',
    [Category.Other]: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryStyles[category]}`}>
      {category}
    </span>
  );
};


const ExpenseList: React.FC<ExpenseListProps> = ({ onEdit }) => {
  const { state, deleteExpense } = useAppContext();
  const [filter, setFilter] = useState<'all' | Category>('all');
  
  const sortedExpenses = [...state.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredExpenses = filter === 'all' 
    ? sortedExpenses 
    : sortedExpenses.filter(exp => exp.category === filter);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-700">Recent Expenses</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as 'all' | Category)}
          className="p-1 border rounded-md bg-base-100 text-sm"
        >
          <option value="all">All Categories</option>
          {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-800">${expense.amount.toFixed(2)}</p>
                    <CategoryBadge category={expense.category} />
                  </div>
                  <p className="text-sm text-gray-500">{expense.notes}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                 <p className="text-sm text-gray-500 hidden sm:block">{new Date(expense.date).toLocaleDateString()}</p>
                <button onClick={() => onEdit(expense)} className="text-gray-500 hover:text-primary">
                  <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => deleteExpense(expense.id)} className="text-gray-500 hover:text-danger">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              {filter === 'all' 
                ? 'No expenses recorded yet.' 
                : `No expenses found in ${filter} category.`
              }
            </p>
            {filter === 'all' && (
              <p className="text-sm text-gray-400">
                Start tracking your expenses by clicking the + button below!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;

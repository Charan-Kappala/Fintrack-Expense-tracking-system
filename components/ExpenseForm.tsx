
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Expense, Category } from '../types';

interface ExpenseFormProps {
  expenseToEdit: Expense | null;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseToEdit, onClose }) => {
  const { addExpense, updateExpense } = useAppContext();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.Food);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      setNotes(expenseToEdit.notes);
    }
  }, [expenseToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid amount.');
        return;
    }
    if (!notes.trim()) {
        setError('Please add a note for the expense.');
        return;
    }

    setError('');

    const expenseData = {
      amount: parsedAmount,
      category,
      date: new Date(date).toISOString(),
      notes,
    };

    if (expenseToEdit) {
      updateExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
      addExpense(expenseData);
    }
    onClose();
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-white font-bold">$</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <p className="text-gray-500 text-sm">
            {expenseToEdit ? 'Update your expense details' : 'Track your spending with ease'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg font-medium">$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors duration-200"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 bg-white transition-colors duration-200"
                required
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 resize-none transition-colors duration-200"
              placeholder="What was this expense for?"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {expenseToEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;

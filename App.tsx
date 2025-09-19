import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import { PlusIcon } from './components/icons';
import { Expense } from './types';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';

function App() {
  const { isSignedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleOpenModal = (expense: Expense | null = null) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  if (!isSignedIn) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-base-200 font-sans text-gray-800">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <Dashboard onEditExpense={handleOpenModal} />
      </main>

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Add new expense"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {isModalOpen && (
        <ExpenseForm
          expenseToEdit={editingExpense}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;
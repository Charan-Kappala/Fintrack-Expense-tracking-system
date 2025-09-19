
import React from 'react';
import BudgetTracker from './BudgetTracker';
import CategoryChart from './CategoryChart';
import SpendingTimeline from './SpendingTimeline';
import ExpenseList from './ExpenseList';
import { Expense } from '../types';

interface DashboardProps {
  onEditExpense: (expense: Expense) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEditExpense }) => {
  return (
    <div className="space-y-6">
      <BudgetTracker />
      
      {/* Timeline Chart */}
      <SpendingTimeline />
      
      {/* Category Chart and Expense List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CategoryChart />
        </div>
        <div className="lg:col-span-2">
          <ExpenseList onEdit={onEditExpense} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

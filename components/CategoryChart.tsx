
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { Category } from '../types';

const COLORS = {
  [Category.Food]: '#10B981',
  [Category.Travel]: '#3B82F6',
  [Category.Bills]: '#F97316',
  [Category.Entertainment]: '#8B5CF6',
  [Category.Shopping]: '#EC4899',
  [Category.Health]: '#F59E0B',
  [Category.Other]: '#6B7280',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-sm text-gray-600">{`$${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};


const CategoryChart: React.FC = () => {
  const { state } = useAppContext();
  const { expenses } = state;

  const data = useMemo(() => {
     const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key in Category]?: number });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);
  
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Expense Breakdown</h3>
        <div className="text-center">
          <p className="text-gray-500 mb-2">No expenses logged for this month yet.</p>
          <p className="text-sm text-gray-400">Your spending categories will appear here once you start adding expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-700 mb-4">Expense Breakdown</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as Category]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;

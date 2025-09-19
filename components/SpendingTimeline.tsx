import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';

const CustomTooltip = ({ active, payload, label, isCumulative }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{`Day ${label}`}</p>
        <p className="text-sm text-blue-600">
          {isCumulative 
            ? `Cumulative: $${payload[0].value.toFixed(2)}`
            : `Daily Total: $${payload[0].value.toFixed(2)}`
          }
        </p>
      </div>
    );
  }
  return null;
};

const SpendingTimeline: React.FC = () => {
  const { state } = useAppContext();
  const { expenses } = state;
  const [isCumulative, setIsCumulative] = useState(false);

  const chartData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Initialize data for each day of the month
    const dailyTotals: { [key: number]: number } = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      dailyTotals[day] = 0;
    }
    
    // Calculate daily totals from expenses
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        const day = expenseDate.getDate();
        dailyTotals[day] += expense.amount;
      }
    });
    
    // Convert to chart format
    const chartData = [];
    let cumulativeTotal = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      cumulativeTotal += dailyTotals[day];
      chartData.push({
        day,
        amount: dailyTotals[day],
        cumulative: cumulativeTotal,
        date: new Date(currentYear, currentMonth, day).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return chartData;
  }, [expenses]);

  const hasData = chartData.some(data => data.amount > 0);
  const maxAmount = Math.max(...chartData.map(data => data.amount));
  const currentDay = new Date().getDate();
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (!hasData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Daily Spending Timeline</h3>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 mb-2">No expenses recorded this month yet.</p>
          <p className="text-sm text-gray-400">
            Your daily spending pattern will appear here once you start adding expenses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-700">Daily Spending Timeline</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCumulative(false)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                !isCumulative 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setIsCumulative(true)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                isCumulative 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cumulative
            </button>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {monthName}
          </span>
        </div>
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              interval={Math.ceil(chartData.length / 10)} // Show ~10 ticks max
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} isCumulative={isCumulative} />} />
            <Line 
              type="monotone" 
              dataKey={isCumulative ? "cumulative" : "amount"}
              stroke={isCumulative ? "#10B981" : "#3B82F6"}
              strokeWidth={3}
              dot={{ fill: isCumulative ? "#10B981" : "#3B82F6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: isCumulative ? "#10B981" : "#3B82F6", strokeWidth: 2, fill: '#fff' }}
            />
            {/* Highlight current day */}
            <Line 
              type="monotone" 
              dataKey={(entry: any) => entry.day === currentDay ? (isCumulative ? entry.cumulative : entry.amount) : null}
              stroke="#EF4444" 
              strokeWidth={0}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isCumulative ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span>{isCumulative ? 'Cumulative Spending' : 'Daily Spending'}</span>
          </div>
          {hasData && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Today</span>
            </div>
          )}
        </div>
        {hasData && (
          <div className="text-right">
            <p className="font-medium">
              {isCumulative 
                ? `Month Total: $${chartData[chartData.length - 1].cumulative.toFixed(2)}`
                : `Peak Day: $${maxAmount.toFixed(2)}`
              }
            </p>
            <p className="text-xs">
              {isCumulative
                ? `Daily Avg: $${(chartData[chartData.length - 1].cumulative / new Date().getDate()).toFixed(2)}`
                : `Daily Avg: $${(chartData.reduce((sum, data) => sum + data.amount, 0) / chartData.filter(data => data.amount > 0).length || 0).toFixed(2)}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingTimeline;
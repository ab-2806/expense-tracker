import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

function CategoryBreakdown({ expenses, onViewAnalytics }) {
  // Exclude settlements from category analysis
  const nonSettlementExpenses = expenses.filter(e => e.type !== 'settlement');

  // Calculate category data
  const categoryData = nonSettlementExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + parseFloat(expense.amount || 0);
    return acc;
  }, {});

  const chartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 categories

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <PieChartIcon size={24} className="text-purple-600" />
            Category Breakdown
          </h2>
        </div>
        <p className="text-center text-gray-500 py-8">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <PieChartIcon size={24} className="text-purple-600" />
          Top Categories
        </h2>
        <button
          onClick={onViewAnalytics}
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          <TrendingUp size={16} />
          View Analytics
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="w-full lg:w-1/2 space-y-2">
          {chartData.map((cat, idx) => (
            <div key={cat.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></div>
                <span className="text-gray-700 truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-semibold text-gray-800">₹{cat.value.toFixed(0)}</span>
                <span className="text-xs text-gray-500">
                  {((cat.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Spending</span>
          <span className="text-lg font-bold text-gray-800">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default CategoryBreakdown;

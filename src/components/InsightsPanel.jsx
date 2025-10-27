import { TrendingUp, TrendingDown, AlertCircle, Award, Calendar } from 'lucide-react';

function InsightsPanel({ expenses, categories, user1Name, user2Name }) {
  if (expenses.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <AlertCircle size={40} className="mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">Add expenses to see insights</p>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Top category
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount || 0);
  });
  const topCategory = Object.entries(categoryTotals).reduce((max, [cat, amt]) => 
    amt > max.amount ? { category: cat, amount: amt } : max, 
    { category: '', amount: 0 }
  );
  const topCategoryInfo = categories.find(c => c.value === topCategory.category);

  // Average daily spend
  const dates = [...new Set(expenses.map(e => e.date))];
  const avgDaily = dates.length > 0 ? totalSpent / dates.length : 0;

  // Largest expense
  const largestExpense = expenses.reduce((max, exp) => 
    parseFloat(exp.amount) > parseFloat(max.amount || 0) ? exp : max,
    expenses[0]
  );
  const largestCategory = categories.find(c => c.value === largestExpense?.category);

  // This month vs last month (if we have last month data)
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthExpenses = expenses.filter(e => new Date(e.date) >= thisMonthStart);
  const lastMonthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const monthChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  const isTrendUp = monthChange > 5;
  const isTrendDown = monthChange < -5;

  // Month projection
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const monthProjection = (thisMonthTotal / daysPassed) * daysInMonth;

  const insights = [
    {
      icon: Award,
      label: 'Top Category',
      value: topCategoryInfo ? topCategoryInfo.label : 'N/A',
      detail: `₹${topCategory.amount.toFixed(0)}`,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Calendar,
      label: 'Average Daily',
      value: `₹${avgDaily.toFixed(0)}`,
      detail: `across ${dates.length} days`,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: isTrendUp ? TrendingUp : isTrendDown ? TrendingDown : TrendingUp,
      label: 'Monthly Trend',
      value: `${monthChange > 0 ? '+' : ''}${monthChange.toFixed(1)}%`,
      detail: isTrendUp ? 'Spending increased' : isTrendDown ? 'Spending decreased' : 'Stable',
      color: isTrendUp ? 'text-red-600 bg-red-100' : isTrendDown ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
    },
    {
      icon: AlertCircle,
      label: 'Largest Expense',
      value: `₹${parseFloat(largestExpense?.amount || 0).toFixed(0)}`,
      detail: largestCategory ? largestCategory.label : 'N/A',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Smart Insights</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${insight.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{insight.label}</p>
              <p className="text-xl font-bold text-gray-800 mb-1">{insight.value}</p>
              <p className="text-xs text-gray-600">{insight.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Month Projection */}
      {daysPassed < daysInMonth && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100 mb-1">Month Projection</p>
              <p className="text-2xl font-bold">₹{monthProjection.toFixed(0)}</p>
              <p className="text-xs text-indigo-200 mt-1">
                Based on {daysPassed} days • {daysInMonth - daysPassed} days remaining
              </p>
            </div>
            <TrendingUp size={40} className="text-indigo-200" />
          </div>
        </div>
      )}
    </div>
  );
}

export default InsightsPanel;

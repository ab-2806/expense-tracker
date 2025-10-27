import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Users, Target, Zap, Filter } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, Legend } from 'recharts';
import { useState } from 'react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

const CATEGORIES = [
  { value: 'groceries', label: '🛒 Groceries', color: '#10b981' },
  { value: 'dining', label: '🍽️ Dining Out', color: '#f59e0b' },
  { value: 'transport', label: '🚗 Transport', color: '#3b82f6' },
  { value: 'entertainment', label: '🎬 Entertainment', color: '#8b5cf6' },
  { value: 'utilities', label: '💡 Utilities', color: '#ef4444' },
  { value: 'healthcare', label: '🏥 Healthcare', color: '#ec4899' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#f97316' },
  { value: 'education', label: '📚 Education', color: '#6366f1' },
  { value: 'other', label: '📦 Other', color: '#6b7280' }
];

function Analytics({ expenses, user1Name, user2Name, onBack }) {
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, month, week
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    user: 'all',
    category: 'all',
    expenseType: 'all'
  });

  // Filter expenses by period AND filters
  const getFilteredExpenses = () => {
    let result = [...expenses];
    
    // Period filter
    const now = new Date();
    if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(e => new Date(e.date) >= monthAgo);
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(e => new Date(e.date) >= weekAgo);
    }

    // User filter
    if (filters.user !== 'all') {
      result = result.filter(e => e.user === filters.user);
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(e => e.category === filters.category);
    }

    // Expense type filter
    if (filters.expenseType !== 'all') {
      result = result.filter(e => (e.type || 'personal') === filters.expenseType);
    }
    
    return result;
  };

  const filteredExpenses = getFilteredExpenses();

  // Exclude settlements from category analysis
  const nonSettlementExpenses = filteredExpenses.filter(e => e.type !== 'settlement');

  // 1. Category Breakdown
  const categoryData = nonSettlementExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + parseFloat(expense.amount || 0);
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  // 2. User Spending Breakdown
  const userSpending = {
    [user1Name]: nonSettlementExpenses
      .filter(e => e.user === user1Name)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    [user2Name]: nonSettlementExpenses
      .filter(e => e.user === user2Name)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  };

  const userChartData = [
    { name: user1Name, value: parseFloat(userSpending[user1Name].toFixed(2)) },
    { name: user2Name, value: parseFloat(userSpending[user2Name].toFixed(2)) }
  ];

  // 3. Personal vs Shared
  const typeBreakdown = {
    personal: nonSettlementExpenses
      .filter(e => e.type === 'personal' || !e.type)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    shared: nonSettlementExpenses
      .filter(e => e.type === 'shared')
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  };

  const typeChartData = [
    { name: 'Personal', value: parseFloat(typeBreakdown.personal.toFixed(2)) },
    { name: 'Shared', value: parseFloat(typeBreakdown.shared.toFixed(2)) }
  ];

  // 4. Daily Spending Trend (Last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const dailySpending = last7Days.map(date => {
    const dayExpenses = nonSettlementExpenses.filter(e => e.date === date);
    const total = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    return {
      date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      amount: parseFloat(total.toFixed(2))
    };
  });

  // 5. Key Metrics
  const totalSpent = nonSettlementExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const avgPerDay = totalSpent / (filteredExpenses.length > 0 ? 
    Math.max(1, Math.ceil((new Date() - new Date(Math.min(...filteredExpenses.map(e => new Date(e.date))))) / (1000 * 60 * 60 * 24))) : 1);
  const avgPerTransaction = totalSpent / (nonSettlementExpenses.length || 1);
  const highestCategory = categoryChartData[0] || { name: 'N/A', value: 0 };
  const totalTransactions = nonSettlementExpenses.length;

  // 6. Shared Expense Analysis
  const sharedExpenses = filteredExpenses.filter(e => e.type === 'shared');
  const totalShared = sharedExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const user1SharedContribution = sharedExpenses.filter(e => e.user === user1Name).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const user2SharedContribution = sharedExpenses.filter(e => e.user === user2Name).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 text-white/90 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-blue-100">Deep insights into your spending</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              showFilters || filters.user !== 'all' || filters.category !== 'all' || filters.expenseType !== 'all'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Filter size={18} />
            Filters
            {(filters.user !== 'all' || filters.category !== 'all' || filters.expenseType !== 'all') && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mt-4">
          {['week', 'month', 'all'].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">User</label>
                <select
                  value={filters.user}
                  onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                  className="w-full border-0 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-white"
                >
                  <option value="all">All Users</option>
                  <option value={user1Name}>{user1Name}</option>
                  <option value={user2Name}>{user2Name}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border-0 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-white"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Type</label>
                <select
                  value={filters.expenseType}
                  onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
                  className="w-full border-0 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-white"
                >
                  <option value="all">All Types</option>
                  <option value="personal">Personal Only</option>
                  <option value="shared">Shared Only</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filters.user !== 'all' || filters.category !== 'all' || filters.expenseType !== 'all') && (
              <button
                onClick={() => setFilters({ user: 'all', category: 'all', expenseType: 'all' })}
                className="mt-3 text-sm text-white/90 hover:text-white underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Active Filters Display */}
        {(filters.user !== 'all' || filters.category !== 'all' || filters.expenseType !== 'all' || selectedPeriod !== 'all') && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
                {selectedPeriod !== 'all' && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    📅 {selectedPeriod === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                  </span>
                )}
                {filters.user !== 'all' && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    👤 {filters.user}
                  </span>
                )}
                {filters.category !== 'all' && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {CATEGORIES.find(c => c.value === filters.category)?.label || filters.category}
                  </span>
                )}
                {filters.expenseType !== 'all' && (
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                    {filters.expenseType === 'personal' ? '👤 Personal' : '👥 Shared'}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setFilters({ user: 'all', category: 'all', expenseType: 'all' });
                  setSelectedPeriod('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredExpenses.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-md text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No expenses found</h3>
            <p className="text-gray-600 mb-4">
              No expenses match your current filters.
            </p>
            <button
              onClick={() => {
                setFilters({ user: 'all', category: 'all', expenseType: 'all' });
                setSelectedPeriod('all');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}

        {filteredExpenses.length > 0 && (
          <>
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-blue-500" size={24} />
              <p className="text-gray-600 text-sm font-semibold">Total Spent</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">₹{totalSpent.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{totalTransactions} transactions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-purple-500" size={24} />
              <p className="text-gray-600 text-sm font-semibold">Avg per Day</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">₹{avgPerDay.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Daily spending rate</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-pink-500">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-pink-500" size={24} />
              <p className="text-gray-600 text-sm font-semibold">Avg Transaction</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">₹{avgPerTransaction.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Per expense</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-orange-500" size={24} />
              <p className="text-gray-600 text-sm font-semibold">Top Category</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{highestCategory.name}</p>
            <p className="text-xs text-gray-500 mt-1">₹{highestCategory.value.toFixed(2)}</p>
          </div>
        </div>

        {/* Daily Spending Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-600" />
            Daily Spending Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySpending}>
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                formatter={(value) => `₹${value}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart size={24} className="text-purple-600" />
              Category Breakdown
            </h2>
            {categoryChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryChartData.slice(0, 8).map((cat, idx) => {
                    const percentage = ((cat.value / (totalSpent || 1)) * 100).toFixed(1);
                    return (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="text-gray-700">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">₹{cat.value.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-12">No expenses yet</p>
            )}
          </div>

          {/* User Spending */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={24} className="text-green-600" />
              Spending by User
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userChartData}>
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  formatter={(value) => `₹${value}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">{user1Name}</p>
                <p className="text-2xl font-bold text-green-600">₹{userSpending[user1Name].toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">{user2Name}</p>
                <p className="text-2xl font-bold text-blue-600">₹{userSpending[user2Name].toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal vs Shared */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target size={24} className="text-orange-600" />
            Personal vs Shared Expenses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Personal Expenses</p>
                <p className="text-3xl font-bold text-purple-600">₹{typeBreakdown.personal.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((typeBreakdown.personal / (totalSpent || 1)) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Shared Expenses</p>
                <p className="text-3xl font-bold text-pink-600">₹{typeBreakdown.shared.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((typeBreakdown.shared / (totalSpent || 1)) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Expense Insights */}
        {totalShared > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={24} className="text-blue-600" />
              Shared Expense Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Shared</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalShared.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{user1Name} Contributed</p>
                <p className="text-2xl font-bold text-green-600">₹{user1SharedContribution.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((user1SharedContribution / (totalShared || 1)) * 100).toFixed(1)}% of shared
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{user2Name} Contributed</p>
                <p className="text-2xl font-bold text-purple-600">₹{user2SharedContribution.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((user2SharedContribution / (totalShared || 1)) * 100).toFixed(1)}% of shared
                </p>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

export default Analytics;

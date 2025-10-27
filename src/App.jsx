import { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database, auth } from './firebase';
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, User, Tag, Download, Plus, Edit2, Trash2, X, Check, Filter, LogOut, RefreshCw } from 'lucide-react';
import Login from './components/Login';
import BalanceCard from './components/BalanceCard';
import PeriodSelector from './components/PeriodSelector';
import InsightsPanel from './components/InsightsPanel';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const CATEGORIES = [
  { value: 'food', label: '🍕 Food', color: '#ef4444' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#3b82f6' },
  { value: 'groceries', label: '🛒 Groceries', color: '#10b981' },
  { value: 'rent', label: '🏠 Rent', color: '#f59e0b' },
  { value: 'travel', label: '✈️ Travel', color: '#8b5cf6' },
  { value: 'clothes', label: '👕 Clothes', color: '#ec4899' },
  { value: 'entertainment', label: '🎬 Entertainment', color: '#6366f1' },
  { value: 'health', label: '💊 Health', color: '#14b8a6' },
  { value: 'utilities', label: '💡 Utilities', color: '#f97316' },
  { value: 'miscellaneous', label: '📦 Misc', color: '#64748b' }
];

const USER1_NAME = import.meta.env.VITE_USER1_NAME || 'Ashwin';
const USER2_NAME = import.meta.env.VITE_USER2_NAME || 'Pooja';
const ENABLE_AUTH = import.meta.env.VITE_ENABLE_AUTH === 'true';

// ALLOWED USERS - Only these emails can access the app
const ALLOWED_EMAILS = [
  'asbt2001@gmail.com',           // Ashwin
  'poojasanklecha9@gmail.com',    // Pooja
];

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ 
    user: 'all', 
    category: 'all', 
    period: 'month',
    expenseType: 'all' // personal, shared, all
  });
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    user: USER1_NAME,
    category: 'food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    type: 'personal', // personal or shared
    customSplitAmount: '', // optional custom split
    useCustomSplit: false
  });

  // Set persistence and handle auth state
  useEffect(() => {
    if (ENABLE_AUTH) {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
              // Check if user's email is in the allowed list
              const userEmail = currentUser.email.toLowerCase();
              if (ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(userEmail)) {
                setUser(currentUser);
              } else {
                // User not authorized - sign them out
                signOut(auth);
                alert(`Access Denied!\n\nOnly authorized users can access this expense tracker.\n\nYour email: ${currentUser.email}\n\nThis app is restricted to Ashwin and Pooja only.`);
                setUser(null);
              }
            } else {
              setUser(null);
            }
            setAuthLoading(false);
          });
          return () => unsubscribe();
        })
        .catch((error) => {
          console.error('Auth persistence error:', error);
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
      setUser({ email: 'demo@demo.com' }); // Demo user when auth disabled
    }
  }, []);

  // Fetch expenses from Firebase
  useEffect(() => {
    if (!ENABLE_AUTH || user) {
      const expensesRef = ref(database, 'expenses');
      
      const unsubscribe = onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expenseList = Object.entries(data).map(([key, value]) => ({
            firebaseKey: key,
            ...value
          }));
          // Sort by expense date (not timestamp), latest first
          setExpenses(expenseList.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } else {
          setExpenses([]);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching expenses:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter expenses based on all criteria
  const filterExpenses = () => {
    let filtered = [...expenses];

    // User filter
    if (filter.user !== 'all') {
      filtered = filtered.filter(e => e.user === filter.user);
    }

    // Category filter
    if (filter.category !== 'all') {
      filtered = filtered.filter(e => e.category === filter.category);
    }

    // Expense type filter (personal/shared)
    if (filter.expenseType !== 'all') {
      filtered = filtered.filter(e => (e.type || 'personal') === filter.expenseType);
    }

    // Period filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filter.period === 'today') {
      filtered = filtered.filter(e => {
        const expDate = new Date(e.date);
        return expDate.toDateString() === today.toDateString();
      });
    } else if (filter.period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
    } else if (filter.period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(e => new Date(e.date) >= monthStart);
    } else if (filter.period === 'custom' && customDateRange.start && customDateRange.end) {
      const startDate = new Date(customDateRange.start);
      const endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59); // Include full end date
      filtered = filtered.filter(e => {
        const expDate = new Date(e.date);
        return expDate >= startDate && expDate <= endDate;
      });
    }

    return filtered;
  };

  const filteredExpenses = filterExpenses();

  // Calculate totals
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const user1Total = filteredExpenses.filter(e => e.user === USER1_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const user2Total = filteredExpenses.filter(e => e.user === USER2_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Personal vs Shared totals
  const personalTotal = filteredExpenses.filter(e => (e.type || 'personal') === 'personal').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const sharedTotal = filteredExpenses.filter(e => e.type === 'shared').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Category breakdown
  const categoryData = CATEGORIES.map(cat => ({
    name: cat.label,
    value: filteredExpenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    color: cat.color
  })).filter(item => item.value > 0);

  // Daily trend for last 30 days
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const dailyTrend = getLast30Days().map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [USER1_NAME]: expenses.filter(e => e.date === date && e.user === USER1_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    [USER2_NAME]: expenses.filter(e => e.date === date && e.user === USER2_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    total: expenses.filter(e => e.date === date).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  }));

  // User comparison
  const userComparison = [
    { name: USER1_NAME, amount: user1Total, fill: '#3b82f6' },
    { name: USER2_NAME, amount: user2Total, fill: '#ec4899' }
  ];

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Calculate split amount for shared expenses
    let splitAmount = 0;
    let splitWith = formData.user === USER1_NAME ? USER2_NAME : USER1_NAME;

    if (formData.type === 'shared') {
      if (formData.useCustomSplit && formData.customSplitAmount) {
        splitAmount = parseFloat(formData.customSplitAmount);
        if (splitAmount > parseFloat(formData.amount)) {
          alert('Split amount cannot be greater than total amount');
          return;
        }
      } else {
        splitAmount = parseFloat(formData.amount) / 2;
      }
    }

    const timestamp = new Date().toISOString();
    const newExpense = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: formData.user,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      timestamp: timestamp,
      note: formData.note || '',
      type: formData.type,
      splitAmount: formData.type === 'shared' ? splitAmount : 0,
      splitWith: formData.type === 'shared' ? splitWith : '',
      customSplit: formData.type === 'shared' ? formData.useCustomSplit : false,
      createdAt: Date.now()
    };

    try {
      await push(ref(database, 'expenses'), newExpense);
      setFormData({
        user: USER1_NAME,
        category: 'food',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        type: 'personal',
        customSplitAmount: '',
        useCustomSplit: false
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Calculate split amount for shared expenses
    let splitAmount = 0;
    let splitWith = formData.user === USER1_NAME ? USER2_NAME : USER1_NAME;

    if (formData.type === 'shared') {
      if (formData.useCustomSplit && formData.customSplitAmount) {
        splitAmount = parseFloat(formData.customSplitAmount);
        if (splitAmount > parseFloat(formData.amount)) {
          alert('Split amount cannot be greater than total amount');
          return;
        }
      } else {
        splitAmount = parseFloat(formData.amount) / 2;
      }
    }

    const updatedExpense = {
      ...editingExpense,
      user: formData.user,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      note: formData.note || '',
      type: formData.type,
      splitAmount: formData.type === 'shared' ? splitAmount : 0,
      splitWith: formData.type === 'shared' ? splitWith : '',
      customSplit: formData.type === 'shared' ? formData.useCustomSplit : false,
      updatedAt: Date.now()
    };

    try {
      await set(ref(database, `expenses/${editingExpense.firebaseKey}`), updatedExpense);
      setShowEditModal(false);
      setEditingExpense(null);
      setFormData({
        user: USER1_NAME,
        category: 'food',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        type: 'personal',
        customSplitAmount: '',
        useCustomSplit: false
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (!confirm(`Delete expense: ${expense.category} - ₹${expense.amount}?`)) {
      return;
    }

    try {
      await remove(ref(database, `expenses/${expense.firebaseKey}`));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      user: expense.user,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      note: expense.note || '',
      type: expense.type || 'personal',
      customSplitAmount: expense.customSplit ? expense.splitAmount.toString() : '',
      useCustomSplit: expense.customSplit || false
    });
    setShowEditModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Category', 'Type', 'Amount', 'Split Amount', 'Note'];
    const rows = filteredExpenses.map(exp => [
      exp.date,
      exp.user,
      CATEGORIES.find(c => c.value === exp.category)?.label || exp.category,
      exp.type || 'personal',
      exp.amount,
      exp.splitAmount || 0,
      exp.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleCustomDateChange = (type, value) => {
    setCustomDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Show login screen if auth is enabled and user not logged in
  if (ENABLE_AUTH && authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (ENABLE_AUTH && !user) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                💰 Expense Tracker
              </h1>
              <p className="text-blue-100 text-sm mt-1 hidden sm:block">
                {USER1_NAME} & {USER2_NAME}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="bg-white/20 hover:bg-white/30 p-2 sm:p-3 rounded-lg transition"
                title="Filters"
              >
                <Filter size={20} />
              </button>
              {ENABLE_AUTH && (
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 p-2 sm:p-3 rounded-lg transition flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline text-sm">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <BalanceCard 
          expenses={filteredExpenses} 
          user1Name={USER1_NAME} 
          user2Name={USER2_NAME}
        />

        {/* Filter Panel */}
        {showFilterMenu && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Filters & Period</h3>
              <button
                onClick={() => setShowFilterMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <PeriodSelector
              selectedPeriod={filter.period}
              onPeriodChange={(period) => setFilter({ ...filter, period })}
              customDateRange={customDateRange}
              onCustomDateChange={handleCustomDateChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">User</label>
                <select
                  value={filter.user}
                  onChange={(e) => setFilter({ ...filter, user: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value={USER1_NAME}>{USER1_NAME}</option>
                  <option value={USER2_NAME}>{USER2_NAME}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={filter.category}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={filter.expenseType}
                  onChange={(e) => setFilter({ ...filter, expenseType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="personal">Personal</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Total Spent</p>
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">₹{totalSpent.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredExpenses.length} expenses</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">{USER1_NAME}</p>
              <User className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600">₹{user1Total.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">{USER2_NAME}</p>
              <User className="text-pink-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-pink-600">₹{user2Total.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Shared</p>
              <Tag className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-purple-600">₹{sharedTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Personal: ₹{personalTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Insights Panel */}
        <InsightsPanel 
          expenses={filteredExpenses} 
          categories={CATEGORIES}
          user1Name={USER1_NAME}
          user2Name={USER2_NAME}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown - Pie Chart */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => `${value}: ₹${entry.payload.value.toFixed(0)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* User Comparison - Bar Chart */}
          {userComparison.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">User Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Bar dataKey="amount" fill="#8884d8" radius={[8, 8, 0, 0]}>
                    {userComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Trend - Line Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Spending Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={USER1_NAME} 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={USER2_NAME} 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  dot={{ fill: '#ec4899' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              Recent Transactions ({filteredExpenses.length})
            </h3>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 transition"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-lg">No expenses found</p>
                <p className="text-gray-400 text-sm mt-2">Add your first expense to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredExpenses.map((expense) => {
                  const category = CATEGORIES.find(c => c.value === expense.category);
                  return (
                    <div
                      key={expense.firebaseKey}
                      className="p-4 hover:bg-gray-50 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          {category?.label.split(' ')[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">{category?.label}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              (expense.type || 'personal') === 'shared' 
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {(expense.type || 'personal') === 'shared' ? '👥 Shared' : '👤 Personal'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {expense.note || 'No note'}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{expense.user}</span>
                            <span>•</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            {expense.type === 'shared' && (
                              <>
                                <span>•</span>
                                <span className="text-purple-600">
                                  Split: ₹{expense.splitAmount?.toFixed(2)} with {expense.splitWith}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-bold text-gray-800">
                          ₹{parseFloat(expense.amount).toFixed(2)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(expense)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition transform hover:scale-110 z-50"
      >
        <Plus size={28} />
      </button>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-xl w-full sm:max-w-md sm:w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Expense Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'personal', useCustomSplit: false, customSplitAmount: ''})}
                    className={`py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      formData.type === 'personal'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👤 Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'shared'})}
                    className={`py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      formData.type === 'shared'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👥 Shared
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Who spent?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, user: USER1_NAME})}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.user === USER1_NAME
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {USER1_NAME}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, user: USER2_NAME})}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.user === USER2_NAME
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {USER2_NAME}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
                  placeholder="Enter amount"
                  required
                  autoFocus
                />
              </div>

              {formData.type === 'shared' && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-purple-900">
                      Custom Split Amount
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.useCustomSplit}
                        onChange={(e) => setFormData({...formData, useCustomSplit: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-xs text-purple-700">Enable</span>
                    </label>
                  </div>
                  {formData.useCustomSplit && (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.customSplitAmount}
                      onChange={(e) => setFormData({...formData, customSplitAmount: e.target.value})}
                      className="w-full border border-purple-300 rounded-lg px-4 py-2 text-sm"
                      placeholder="Enter split amount"
                    />
                  )}
                  <p className="text-xs text-purple-700">
                    {formData.useCustomSplit && formData.customSplitAmount
                      ? `${formData.user === USER1_NAME ? USER2_NAME : USER1_NAME} will owe ₹${formData.customSplitAmount}`
                      : `Default 50/50 split (₹${formData.amount ? (parseFloat(formData.amount) / 2).toFixed(2) : '0.00'} each)`
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="e.g., Dinner at restaurant"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-xl w-full sm:max-w-md sm:w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit Expense</h2>
              <button onClick={() => { setShowEditModal(false); setEditingExpense(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Expense Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'personal', useCustomSplit: false, customSplitAmount: ''})}
                    className={`py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      formData.type === 'personal'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👤 Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'shared'})}
                    className={`py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      formData.type === 'shared'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👥 Shared
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Who spent?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, user: USER1_NAME})}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.user === USER1_NAME
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {USER1_NAME}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, user: USER2_NAME})}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.user === USER2_NAME
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {USER2_NAME}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
                  placeholder="Enter amount"
                  required
                  autoFocus
                />
              </div>

              {formData.type === 'shared' && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-purple-900">
                      Custom Split Amount
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.useCustomSplit}
                        onChange={(e) => setFormData({...formData, useCustomSplit: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-xs text-purple-700">Enable</span>
                    </label>
                  </div>
                  {formData.useCustomSplit && (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.customSplitAmount}
                      onChange={(e) => setFormData({...formData, customSplitAmount: e.target.value})}
                      className="w-full border border-purple-300 rounded-lg px-4 py-2 text-sm"
                      placeholder="Enter split amount"
                    />
                  )}
                  <p className="text-xs text-purple-700">
                    {formData.useCustomSplit && formData.customSplitAmount
                      ? `${formData.user === USER1_NAME ? USER2_NAME : USER1_NAME} will owe ₹${formData.customSplitAmount}`
                      : `Default 50/50 split (₹${formData.amount ? (parseFloat(formData.amount) / 2).toFixed(2) : '0.00'} each)`
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="e.g., Dinner at restaurant"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

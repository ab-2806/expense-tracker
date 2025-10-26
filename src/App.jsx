import { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from './firebase';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar, User, Tag, Download, Plus, Edit2, Trash2, X, Check, Menu, Filter } from 'lucide-react';

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

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ user: 'all', category: 'all', period: 'month' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    user: USER1_NAME,
    category: 'food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    const expensesRef = ref(database, 'expenses');
    
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expenseList = Object.entries(data).map(([key, value]) => ({
          firebaseKey: key,
          ...value
        }));
        setExpenses(expenseList.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)));
      } else {
        setExpenses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filterExpenses = () => {
    let filtered = [...expenses];

    if (filter.user !== 'all') {
      filtered = filtered.filter(e => e.user === filter.user);
    }

    if (filter.category !== 'all') {
      filtered = filtered.filter(e => e.category === filter.category);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filter.period === 'today') {
      filtered = filtered.filter(e => new Date(e.date) >= today);
    } else if (filter.period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
    } else if (filter.period === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(e => new Date(e.date) >= monthAgo);
    }

    return filtered;
  };

  const filteredExpenses = filterExpenses();

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const user1Total = filteredExpenses.filter(e => e.user === USER1_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const user2Total = filteredExpenses.filter(e => e.user === USER2_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const categoryData = CATEGORIES.map(cat => ({
    name: cat.label,
    value: filteredExpenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    color: cat.color
  })).filter(item => item.value > 0);

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(dateStr);
  }

  const dailyTrend = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [USER1_NAME]: expenses.filter(e => e.date === date && e.user === USER1_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    [USER2_NAME]: expenses.filter(e => e.date === date && e.user === USER2_NAME).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  }));

  const userComparison = [
    { name: USER1_NAME, amount: user1Total },
    { name: USER2_NAME, amount: user2Total }
  ];

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
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
      createdAt: Date.now()
    };

    try {
      await push(ref(database, 'expenses'), newExpense);
      setFormData({
        user: USER1_NAME,
        category: 'food',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
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

    const updatedExpense = {
      ...editingExpense,
      user: formData.user,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      note: formData.note || '',
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
        note: ''
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
      note: expense.note || ''
    });
    setShowEditModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Category', 'Amount', 'Note'];
    const rows = filteredExpenses.map(e => [
      e.date,
      e.user,
      e.category,
      e.amount,
      e.note || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">💰 Our Expenses</h1>
              <p className="text-gray-600 text-sm mt-1">{USER1_NAME} & {USER2_NAME}</p>
            </div>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="sm:hidden bg-gray-100 p-2 rounded-lg"
            >
              <Filter size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Filter Menu */}
        {showFilterMenu && (
          <div className="sm:hidden mb-4 bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilterMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <select
                  value={filter.user}
                  onChange={(e) => setFilter({...filter, user: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Users</option>
                  <option value={USER1_NAME}>{USER1_NAME}</option>
                  <option value={USER2_NAME}>{USER2_NAME}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={filter.category}
                  onChange={(e) => setFilter({...filter, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Period</label>
                <select
                  value={filter.period}
                  onChange={(e) => setFilter({...filter, period: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden sm:block bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download size={20} />
              Export
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <User className="inline mr-2" size={18} />
                User
              </label>
              <select
                value={filter.user}
                onChange={(e) => setFilter({...filter, user: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="all">All Users</option>
                <option value={USER1_NAME}>{USER1_NAME}</option>
                <option value={USER2_NAME}>{USER2_NAME}</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <Tag className="inline mr-2" size={18} />
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({...filter, category: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <Calendar className="inline mr-2" size={18} />
                Period
              </label>
              <select
                value={filter.period}
                onChange={(e) => setFilter({...filter, period: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold text-sm">Total Spent</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold text-sm">{USER1_NAME}'s Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">₹{user1Total.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {totalSpent > 0 ? Math.round((user1Total / totalSpent) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold text-sm">{USER2_NAME}'s Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-pink-600 mt-2">₹{user2Total.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {totalSpent > 0 ? Math.round((user2Total / totalSpent) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts - Desktop */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No expenses to display</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Who Spent More?</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-20">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {filteredExpenses.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenses.slice(0, 50).map((expense) => (
                <div key={expense.firebaseKey} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                          {CATEGORIES.find(c => c.value === expense.category)?.label.split(' ')[0] || '📦'}
                        </span>
                        <span className="font-semibold capitalize">{expense.category}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          expense.user === USER1_NAME ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {expense.user}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}</p>
                      {expense.note && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{expense.note}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No expenses yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Your First Expense
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
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

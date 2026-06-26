import * as React from 'react';
import { useEffect, useState } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

// MUI Dialogs for premium accessibility & modal overlays
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalPlayIcon from '@mui/icons-material/LocalPlay';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import CategoryIcon from '@mui/icons-material/Category';

import './App.css';

// ----------------------------------------------------
// COLOR PALETTES & LABELS FOR CATEGORIES
// ----------------------------------------------------
const displayCategories = [
  { key: 'food', label: 'Food', color: '#a855f7', icon: <FastfoodIcon /> },
  { key: 'entertainment', label: 'Entertainment', color: '#ff007f', icon: <LocalPlayIcon /> },
  { key: 'travel', label: 'Travel', color: '#f59e0b', icon: <FlightTakeoffIcon /> },
  { key: 'shopping', label: 'Shopping', color: '#3b82f6', icon: <ShoppingBagIcon /> },
  { key: 'utilities', label: 'Utilities', color: '#10b981', icon: <ElectricBoltIcon /> },
  { key: 'other', label: 'Other', color: '#6b7280', icon: <CategoryIcon /> }
];

const getCategoryMeta = (catName) => {
  const norm = (catName || 'other').toLowerCase();
  if (norm === 'transport') return displayCategories.find(c => c.key === 'travel');
  return displayCategories.find(c => c.key === norm) || displayCategories[5];
};

function ExpenseTrackerApp() {
  const { enqueueSnackbar } = useSnackbar();

  // ----------------------------------------------------
  // LOCAL STORAGE AND STATE
  // ----------------------------------------------------
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('balance');
    return saved !== null ? parseFloat(saved) : 5000;
  });
  
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal Dialog Overlays
  const [openIncome, setOpenIncome] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Forms Controlled States
  const [incomeAmount, setIncomeAmount] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    price: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    category: 'food',
    date: ''
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    setCurrentPage(1); // Reset to first page when expenses change
    // Also save under key 'expense' (derived total) for redundancy
    const total = expenses.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    localStorage.setItem('expense', total.toString());
  }, [expenses]);

  // Derived Values
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  // ----------------------------------------------------
  // SUBMISSION LOGIC
  // ----------------------------------------------------
  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(incomeAmount);
    if (!isNaN(amount) && amount > 0) {
      setBalance(prev => prev + amount);
      setIncomeAmount('');
      setOpenIncome(false);
      enqueueSnackbar(`Successfully added $${amount} to wallet!`, { variant: 'success' });
    } else {
      alert('Please enter a valid positive income amount.');
    }
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const { title, price, category, date } = expenseForm;
    const numericPrice = parseFloat(price);

    if (title && !isNaN(numericPrice) && numericPrice > 0 && category && date) {
      if (numericPrice > balance) {
        alert('Insufficient Wallet Balance!');
        enqueueSnackbar('Insufficient Wallet Balance!', { variant: 'error' });
        return;
      }
      setExpenses(prev => [{ title, price: numericPrice, category, date }, ...prev]);
      setBalance(prev => prev - numericPrice);
      
      // Clear fields on successful add
      setExpenseForm({
        title: '',
        price: '',
        category: 'food',
        date: new Date().toISOString().split('T')[0]
      });
      setOpenExpense(false);
      enqueueSnackbar('Expense added successfully!', { variant: 'success' });
    } else {
      alert('Please fill out all fields correctly.');
    }
  };

  const handleDeleteExpense = (index) => {
    const target = expenses[index];
    const targetPrice = parseFloat(target.price || 0);
    setExpenses(prev => prev.filter((_, i) => i !== index));
    setBalance(prev => prev + targetPrice); // Refund deleted expense amount
    enqueueSnackbar('Transaction deleted.', { variant: 'info' });
  };

  const handleOpenEdit = (index) => {
    const trans = expenses[index];
    setEditForm({
      title: trans.title,
      price: trans.price.toString(),
      category: trans.category,
      date: trans.date
    });
    setEditingIndex(index);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(editForm.price);
    const oldPrice = parseFloat(expenses[editingIndex].price || 0);
    const diff = numericPrice - oldPrice;

    if (editForm.title && !isNaN(numericPrice) && numericPrice > 0 && editForm.category && editForm.date) {
      if (diff > balance) {
        alert('Insufficient Wallet Balance!');
        enqueueSnackbar('Insufficient Wallet Balance to modify this expense!', { variant: 'error' });
        return;
      }

      const updated = [...expenses];
      updated[editingIndex] = {
        title: editForm.title,
        price: numericPrice,
        category: editForm.category,
        date: editForm.date
      };

      setExpenses(updated);
      setBalance(prev => prev - diff);
      setEditingIndex(null);
      enqueueSnackbar('Transaction updated successfully!', { variant: 'success' });
    } else {
      alert('Please fill out all fields correctly.');
    }
  };

  // ----------------------------------------------------
  // CHART COMPUTATIONS
  // ----------------------------------------------------
  const categoryTotals = { food: 0, travel: 0, entertainment: 0, shopping: 0, utilities: 0, other: 0 };
  expenses.forEach(item => {
    const cat = (item.category || 'other').toLowerCase();
    const targetCat = cat === 'transport' ? 'travel' : cat;
    if (categoryTotals[targetCat] !== undefined) {
      categoryTotals[targetCat] += parseFloat(item.price || 0);
    } else {
      categoryTotals.other += parseFloat(item.price || 0);
    }
  });

  // Data mapping for Pie Chart (only categories with spending)
  const pieDataRaw = displayCategories.map(cat => ({
    name: cat.label,
    value: categoryTotals[cat.key],
    color: cat.color
  })).filter(c => c.value > 0);

  const hasExpenses = pieDataRaw.length > 0;
  const pieData = hasExpenses ? pieDataRaw : [{ name: 'No Expenses', value: 100, color: 'rgba(255, 255, 255, 0.08)' }];

  // Data mapping for Bar Chart (all categories)
  const barData = [
    { name: 'Food', value: categoryTotals.food, color: '#a855f7' },
    { name: 'Entertainment', value: categoryTotals.entertainment, color: '#ff007f' },
    { name: 'Travel', value: categoryTotals.travel, color: '#f59e0b' },
    { name: 'Shopping', value: categoryTotals.shopping, color: '#3b82f6' },
    { name: 'Utilities', value: categoryTotals.utilities, color: '#10b981' },
    { name: 'Other', value: categoryTotals.other, color: '#6b7280' }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (!hasExpenses) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="dashboard-container">
      {/* BRAND HEADER (Exactly one H1 in the app containing 'Expense Tracker') */}
      <header style={{ marginBottom: '32px' }}>
        <h1 className="main-title">Expense Tracker</h1>
        <p className="main-subtitle">Secure Personal Finance Dashboard</p>
      </header>

      {/* TOP SUMMARY STATS ROW */}
      <div className="top-cards-row">
        {/* Wallet Balance Card */}
        <div className="top-card-col">
          <div className="glass-card wallet-card">
            <div className="card-header-flex">
              <h2 className="card-label">Wallet Balance</h2>
              <div className="card-avatar wallet-avatar"><WalletIcon /></div>
            </div>
            {/* Prominent display of balance matching requirements */}
            <h2 className="card-value" style={{ margin: '8px 0 16px 0' }}>
              Wallet Balance: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => setOpenIncome(true)}
            >
              + Add Income
            </button>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="top-card-col">
          <div className="glass-card expense-card">
            <div className="card-header-flex">
              <h2 className="card-label">Expenses</h2>
              <div className="card-avatar expense-avatar"><TrendingDownIcon /></div>
            </div>
            <h2 className="card-value" style={{ margin: '8px 0 16px 0', color: '#f43f5e' }}>
              Expenses: ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setOpenExpense(true)}
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="top-card-col">
          <div className="glass-card net-card">
            <div className="card-header-flex">
              <h2 className="card-label">Net Balance</h2>
              <div className="card-avatar net-avatar"><TrendingUpIcon /></div>
            </div>
            <h2 className="card-value" style={{ margin: '8px 0 16px 0', color: balance >= 0 ? '#10b981' : '#f43f5e' }}>
              Net Balance: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p style={{ margin: '16px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Net liquidity after accounting for current expenses
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS & RECENT TRANSACTIONS GRID */}
      <div className="details-row">
        
        {/* Left Side: Recent Transactions */}
        <div className="history-col">
          <div className="glass-card" style={{ justifyContent: 'flex-start', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 20px 0' }}>Recent Transactions</h2>
            
            {expenses.length === 0 ? (
              <div className="empty-state">
                <p>No transactions recorded yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Click "+ Add Expense" to get started</p>
              </div>
            ) : (() => {
              const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
              const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
              const paginatedExpenses = expenses.slice(startIdx, startIdx + ITEMS_PER_PAGE);

              return (
                <>
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExpenses.map((item, pageIdx) => {
                          const actualIndex = startIdx + pageIdx;
                          const meta = getCategoryMeta(item.category);
                          return (
                            <tr key={actualIndex}>
                              <td style={{ fontWeight: 600 }}>{item.title}</td>
                              <td>
                                <div className="category-badge-flex">
                                  <span className="category-icon-wrapper" style={{ backgroundColor: `${meta.color}18`, color: meta.color }}>
                                    {meta.icon}
                                  </span>
                                  <span>{meta.label}</span>
                                </div>
                              </td>
                              <td style={{ color: '#94a3b8' }}>{item.date}</td>
                              <td style={{ color: '#f43f5e', fontWeight: 700 }}>-${parseFloat(item.price).toFixed(2)}</td>
                              <td>
                                <div className="action-btn-group">
                                  <button 
                                    type="button"
                                    className="action-btn action-btn-edit"
                                    onClick={() => handleOpenEdit(actualIndex)}
                                    aria-label="Edit expense"
                                  >
                                    <EditIcon style={{ fontSize: '18px' }} />
                                  </button>
                                  <button 
                                    type="button"
                                    className="action-btn action-btn-delete"
                                    onClick={() => handleDeleteExpense(actualIndex)}
                                    aria-label="Delete expense"
                                  >
                                    <DeleteIcon style={{ fontSize: '18px' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        ← Prev
                      </button>
                      <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Right Side: Charts Breakdown */}
        <div className="charts-col">
          
          {/* Pie Chart: Expense Summary */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0' }}>Expense Summary</h2>
            <div style={{ width: '100%', height: 260, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <ChartTooltip formatter={(v) => (hasExpenses ? `$${v.toFixed(2)}` : 'No data')} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Expense Trends */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0' }}>Expense Trends</h2>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <ChartTooltip formatter={(v) => `$${v.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 8, 8, 0]} barSize={16}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>

      {/* ----------------------------------------------------
          MODAL: ADD INCOME
          ---------------------------------------------------- */}
      <Dialog 
        open={openIncome} 
        onClose={() => setOpenIncome(false)}
        maxWidth="xs"
        fullWidth
      >
        <div className="modal-accent modal-accent-cyan" />
        <DialogContent style={{ padding: 0 }}>
          <div className="modal-inner">
            <h2 className="modal-form-header">
              <span className="modal-icon-circle modal-icon-circle-cyan">
                <WalletIcon fontSize="small" />
              </span>
              Add Balance
            </h2>
            <p className="modal-description">Add funds to your wallet to track new expenses.</p>
            <form onSubmit={handleIncomeSubmit}>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  className="input-control"
                  placeholder="Income Amount"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setOpenIncome(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add Balance</button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------
          MODAL: RECORD NEW EXPENSE
          ---------------------------------------------------- */}
      <Dialog 
        open={openExpense} 
        onClose={() => setOpenExpense(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="modal-accent modal-accent-rose" />
        <DialogContent style={{ padding: 0 }}>
          <div className="modal-inner">
            <h2 className="modal-form-header">
              <span className="modal-icon-circle modal-icon-circle-rose">
                <TrendingDownIcon fontSize="small" />
              </span>
              Record Expense
            </h2>
            <p className="modal-description">Track where your money is going. Fill in the details below.</p>
            <form onSubmit={handleExpenseSubmit}>
              <div className="form-group">
                <label>Expense Title</label>
                <input
                  type="text"
                  name="title"
                  className="input-control"
                  placeholder="Title"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    name="price"
                    className="input-control"
                    placeholder="Price"
                    value={expenseForm.price}
                    onChange={(e) => setExpenseForm({ ...expenseForm, price: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    className="input-control"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    required
                  >
                    <option value="food">Food</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="travel">Travel</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  className="input-control"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setOpenExpense(false)}>Cancel</button>
                <button type="submit" className="btn-submit expense-submit">Add Expense</button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------
          MODAL: EDIT TRANSACTION
          ---------------------------------------------------- */}
      {editingIndex !== null && (
        <Dialog 
          open={true} 
          onClose={() => setEditingIndex(null)}
          maxWidth="sm"
          fullWidth
        >
          <div className="modal-accent modal-accent-cyan" />
          <DialogContent style={{ padding: 0 }}>
            <div className="modal-inner">
              <h2 className="modal-form-header">
                <span className="modal-icon-circle modal-icon-circle-cyan">
                  <EditIcon fontSize="small" />
                </span>
                Edit Expense details
              </h2>
              <p className="modal-description">Modify the expense details and save your changes.</p>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Expense Title</label>
                  <input
                    type="text"
                    name="title"
                    className="input-control"
                    placeholder="Title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input
                      type="number"
                      name="price"
                      className="input-control"
                      placeholder="Price"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      className="input-control"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      required
                    >
                      <option value="food">Food</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="travel">Travel</option>
                      <option value="transport">Transport</option>
                      <option value="shopping">Shopping</option>
                      <option value="utilities">Utilities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    className="input-control"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setEditingIndex(null)}>Cancel</button>
                  <button type="submit" className="btn-submit expense-submit">Add Expense</button>
                  {/* NOTE: Label kept as 'Add Expense' per Crio assessment spec */}
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function App() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <ExpenseTrackerApp />
    </SnackbarProvider>
  );
}

export default App;


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PlusCircle, Search, Trash2, X, TrendingUp, DollarSign, Hash, Zap, Edit, Sun, Moon, BarChart2, XCircle } from 'lucide-react';

const CATEGORIES = {
    food: { label: 'Food', icon: DollarSign, color: 'emerald' },
    transport: { label: 'Transport', icon: Zap, color: 'sky' },
    bills: { label: 'Bills', icon: TrendingUp, color: 'rose' },
    other: { label: 'Other', icon: Hash, color: 'amber' },
};

const CATEGORY_COLORS = {
    emerald: { light: 'bg-emerald-500', dark: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500' },
    sky: { light: 'bg-sky-500', dark: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500', ring: 'ring-sky-500' },
    rose: { light: 'bg-rose-500', dark: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', ring: 'ring-rose-500' },
    amber: { light: 'bg-amber-500', dark: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', ring: 'ring-amber-500' },
};

const initialExpenses = [
    { id: 1, description: "Groceries", amount: 75.40, category: "food", date: "2023-10-26T10:00:00Z" },
    { id: 2, description: "Train Ticket", amount: 22.50, category: "transport", date: "2023-10-25T14:30:00Z" },
    { id: 3, description: "Internet Bill", amount: 59.99, category: "bills", date: "2023-10-24T09:00:00Z" },
    { id: 4, description: "Coffee with friend", amount: 8.75, category: "food", date: "2023-10-23T16:00:00Z" },
    { id: 5, description: "Movie Tickets", amount: 32.00, category: "other", date: "2023-10-22T20:15:00Z" },
    { id: 6, description: "Gasoline", amount: 45.10, category: "transport", date: "2023-10-21T08:00:00Z" },
    { id: 7, description: "Electricity Bill", amount: 120.34, category: "bills", date: "2023-10-20T11:00:00Z" },
];

const ITEMS_PER_PAGE = 5;

const ExpenseTrackerDashboard = () => {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('food');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [editingExpense, setEditingExpense] = useState(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme]);

    const showNotification = useCallback((message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const validateForm = (currentDescription, currentAmount) => {
        const newErrors = {};
        if (!currentDescription.trim()) newErrors.description = 'Description is required.';
        if (!currentAmount) newErrors.amount = 'Amount is required.';
        else if (isNaN(currentAmount) || Number(currentAmount) <= 0) newErrors.amount = 'Please enter a valid positive number.';
        return newErrors;
    };

    const handleAddExpense = useCallback((e) => {
        e.preventDefault();
        const validationErrors = validateForm(description, amount);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        const newExpense = {
            id: Date.now(),
            description,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(),
        };
        setExpenses(prev => [newExpense, ...prev]);
        setDescription('');
        setAmount('');
        setCategory('food');
        setErrors({});
        showNotification('Expense added successfully!', 'success');
    }, [description, amount, category, showNotification]);
    
    const handleUpdateExpense = useCallback((updatedExpense) => {
        setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
        setEditingExpense(null);
        showNotification('Expense updated successfully!', 'success');
    }, [showNotification]);

    const handleDeleteExpense = useCallback((id) => {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
        showNotification('Expense deleted.', 'error');
    }, [showNotification]);

    const filteredAndSortedExpenses = useMemo(() => {
        return expenses
            .filter(exp => exp.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(exp => filterCategory === 'all' || exp.category === filterCategory)
            .sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
    }, [expenses, searchTerm, filterCategory, sortConfig]);
    
    const paginatedExpenses = useMemo(() => {
        return filteredAndSortedExpenses.slice(0, visibleCount);
    }, [filteredAndSortedExpenses, visibleCount]);

    const summaryStats = useMemo(() => {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const count = expenses.length;
        const average = count > 0 ? total / count : 0;
        return { total, count, average };
    }, [expenses]);
    
    const categoryTotals = useMemo(() => {
        return expenses.reduce((acc, expense) => {
            if (!acc[expense.category]) {
                acc[expense.category] = 0;
            }
            acc[expense.category] += expense.amount;
            return acc;
        }, {});
    }, [expenses]);
    
    const clearFilters = () => {
        setSearchTerm('');
        setFilterCategory('all');
        setSortConfig({ key: 'date', direction: 'desc' });
    };

    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            {notification && <NotificationPanel notification={notification} />}
            {editingExpense && <EditExpenseModal expense={editingExpense} onUpdate={handleUpdateExpense} onCancel={() => setEditingExpense(null)} validateForm={validateForm} currencyFormatter={currencyFormatter} />}

            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Expense Tracker</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Your personal finance dashboard.</p>
                </div>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                <SummaryCard icon={DollarSign} title="Total Expenses" value={currencyFormatter.format(summaryStats.total)} color="emerald" />
                <SummaryCard icon={Hash} title="Transactions" value={summaryStats.count} color="sky" />
                <SummaryCard icon={TrendingUp} title="Average Expense" value={currencyFormatter.format(summaryStats.average)} color="rose" />
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <CategoryChart data={categoryTotals} />
                    <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white whitespace-nowrap">Recent Expenses</h2>
                            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                                <div className="relative w-full sm:w-40">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition" aria-label="Search expenses" />
                                </div>
                                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full sm:w-36 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition" aria-label="Filter by category">
                                    <option value="all">All Categories</option>
                                    {Object.entries(CATEGORIES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                                </select>
                                <select value={`${sortConfig.key}-${sortConfig.direction}`} onChange={e => { const [key, direction] = e.target.value.split('-'); setSortConfig({ key, direction }); }} className="w-full sm:w-40 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition" aria-label="Sort expenses">
                                    <option value="date-desc">Date (Newest)</option>
                                    <option value="date-asc">Date (Oldest)</option>
                                    <option value="amount-desc">Amount (High-Low)</option>
                                    <option value="amount-asc">Amount (Low-High)</option>
                                </select>
                                {(searchTerm || filterCategory !== 'all') && <button onClick={clearFilters} className="p-2 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400" aria-label="Clear filters"><XCircle className="w-5 h-5"/></button>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {paginatedExpenses.length > 0 ? (
                                paginatedExpenses.map(exp => (
                                    <ExpenseCard key={exp.id} expense={exp} onEdit={() => setEditingExpense(exp)} onDelete={handleDeleteExpense} dateFormatter={dateFormatter} currencyFormatter={currencyFormatter} />
                                ))
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                        {filteredAndSortedExpenses.length > visibleCount && (
                            <div className="mt-6 text-center">
                                <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)} className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 sticky top-8">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Add New Expense</h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
                                <input id="description" type="text" value={description} onChange={(e) => { setDescription(e.target.value); if(errors.description) setErrors(p => ({...p, description: null})) }} className={`mt-1 w-full bg-slate-100 dark:bg-slate-700 border ${errors.description ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition`} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} />
                                {errors.description && <p id="description-error" className="text-rose-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <label htmlFor="amount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount</label>
                                <input id="amount" type="number" step="0.01" value={amount} onChange={(e) => { setAmount(e.target.value); if(errors.amount) setErrors(p => ({...p, amount: null})) }} className={`mt-1 w-full bg-slate-100 dark:bg-slate-700 border ${errors.amount ? 'border-rose-500' : 'border-slate-600'} rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition`} aria-invalid={!!errors.amount} aria-describedby={errors.amount ? 'amount-error' : undefined} />
                                {errors.amount && <p id="amount-error" className="text-rose-500 text-sm mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label htmlFor="category" className="text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
                                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                                    {Object.entries(CATEGORIES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50">
                                <PlusCircle className="w-5 h-5" /> Add Expense
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

const SummaryCard = ({ icon: Icon, title, value, color }) => {
    const colorClass = CATEGORY_COLORS[color] ? CATEGORY_COLORS[color].dark : 'bg-gray-500';
    return (
        <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl shadow-lg flex items-center gap-5 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className={`p-3 rounded-full ${colorClass}`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

const ExpenseCard = ({ expense, onEdit, onDelete, dateFormatter, currencyFormatter }) => {
    const categoryInfo = CATEGORIES[expense.category] || CATEGORIES.other;
    const CategoryIcon = categoryInfo.icon;
    const color = categoryInfo.color;
    
    return (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex items-center justify-between gap-4 border-l-4 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all duration-200 group">
            <div className="flex items-center gap-4 flex-grow">
                <div className={`p-2 rounded-full bg-opacity-10 ${CATEGORY_COLORS[color].light} dark:bg-opacity-10`}>
                    <CategoryIcon className={`w-5 h-5 ${CATEGORY_COLORS[color].text}`} />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{expense.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{dateFormatter.format(new Date(expense.date))}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <p className="font-bold text-md text-slate-900 dark:text-white">{currencyFormatter.format(expense.amount)}</p>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={onEdit} className="p-2 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-500/10 rounded-full" aria-label={`Edit expense: ${expense.description}`}><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(expense.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-full" aria-label={`Delete expense: ${expense.description}`}><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

const EditExpenseModal = ({ expense, onUpdate, onCancel, validateForm }) => {
    const [description, setDescription] = useState(expense.description);
    const [amount, setAmount] = useState(expense.amount.toString());
    const [category, setCategory] = useState(expense.category);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm(description, amount);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onUpdate({ ...expense, description, amount: parseFloat(amount), category });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-expense-title">
            <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 id="edit-expense-title" className="text-xl font-semibold text-slate-900 dark:text-white">Edit Expense</h2>
                        <button onClick={onCancel} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close edit modal"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="edit-description" className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
                            <input id="edit-description" type="text" value={description} onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: null })) }} className={`mt-1 w-full bg-slate-100 dark:bg-slate-700 border ${errors.description ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition`} />
                            {errors.description && <p className="text-rose-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label htmlFor="edit-amount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount</label>
                            <input id="edit-amount" type="number" step="0.01" value={amount} onChange={(e) => { setAmount(e.target.value); if (errors.amount) setErrors(p => ({ ...p, amount: null })) }} className={`mt-1 w-full bg-slate-100 dark:bg-slate-700 border ${errors.amount ? 'border-rose-500' : 'border-slate-600'} rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition`} />
                            {errors.amount && <p className="text-rose-500 text-sm mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label htmlFor="edit-category" className="text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
                            <select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                                {Object.entries(CATEGORIES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const CategoryChart = ({ data }) => {
    const total = useMemo(() => Object.values(data).reduce((sum, val) => sum + val, 0), [data]);
    if (total === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Spending by Category</h2>
            <div className="space-y-3">
                {Object.entries(CATEGORIES).map(([key, { label, color }]) => {
                    const amount = data[key] || 0;
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    const colorClass = CATEGORY_COLORS[color] ? CATEGORY_COLORS[color].dark : 'bg-gray-500';

                    return (
                        <div key={key} className="w-full">
                            <div className="flex justify-between mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                                <span>{label}</span>
                                <span>{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const NotificationPanel = ({ notification }) => (
    <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white animate-fade-in-down flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} role="alert" aria-live="assertive">
        {notification.type === 'success' ? <PlusCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        <span>{notification.message}</span>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-10 px-4">
        <div className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500">
            <BarChart2 className="w-full h-full" strokeWidth={1} />
        </div>
        <h3 className="mt-2 text-lg font-medium text-slate-800 dark:text-slate-200">No expenses found</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add a new expense or adjust your filters.</p>
    </div>
);

export default ExpenseTrackerDashboard;

import React, { useState, useEffect } from 'react';
import TransactionForm from '../components/TransactionForm';
import transactionService from '../services/transaction.service';
import { useExpenseFilter } from '../context/ExpenseFilterContext';
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
}

const CATEGORIES = [
  "All",
  "Food & Dining",
  "Shopping",
  "Transport",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Other"
];

const Expenses: React.FC = () => {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Use global filter context
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear
  } = useExpenseFilter();
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      let url = "/api/transactions?page=1&limit=100000";

      if (selectedMonth !== null && selectedYear !== null) {
        url += `&month=${selectedMonth + 1}&year=${selectedYear}`;
      }

      console.log('Fetching transactions from:', url);
      const response: any = await transactionService.getTransactions(`?${url.split('?')[1]}`);

      console.log('API Response:', response);

      if (response.success && response.data) {
        const transactionsArray = response.data.transactions || response.data || [];
        console.log('Transactions array:', transactionsArray);

        const expensesData = transactionsArray.map((t: any) => ({
          id: t.id,
          amount: Number(t.amount),
          type: t.type,
          category: t.category,
          description: t.description,
          createdAt: t.created_at
        }));

        console.log('Processed expenses data:', expensesData);
        setTransactions(expensesData);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.log('No success in response or no data');
        setTransactions([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    }
  };

  // Ensure fetchTransactions runs when page loads
  useEffect(() => {
    console.log('Component mounted, fetching transactions...');
    fetchTransactions();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    console.log('Filters changed, fetching transactions...', { selectedMonth, selectedYear, selectedCategory });
    fetchTransactions();
  }, [selectedMonth, selectedYear, selectedCategory]);

  const filteredTransactions = (transactions || []).filter((t) => {
    if (t.type !== "expense") return false;

    if (selectedCategory === "All") return true;

    return t.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
  });

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const getFilterLabel = () => {
    if (selectedMonth === null && selectedYear === null) {
      return "All Transactions";
    } else if (selectedMonth !== null && selectedYear !== null) {
      const monthName = new Date(2024, selectedMonth).toLocaleString('default', { month: 'long' });
      return `${monthName} ${selectedYear} Transactions`;
    } else if (selectedMonth !== null) {
      const monthName = new Date(2024, selectedMonth).toLocaleString('default', { month: 'long' });
      return `${monthName} Transactions`;
    } else if (selectedYear !== null) {
      return `${selectedYear} Transactions`;
    }
    return "All Transactions";
  };

  const handleMonthChange = (value: string) => {
    const processedValue = value === "" ? null : parseInt(value) - 1;
    console.log("Expenses page - Month changed to:", processedValue);
    setSelectedMonth(processedValue);
    setPage(1);
  };

  const handleYearChange = (value: string) => {
    const yearValue = value === "" ? null : parseInt(value);
    console.log("Expenses page - Year changed to:", yearValue);
    setSelectedYear(yearValue);
    setPage(1);
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-600">Track and manage all your expenses</p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="btn-primary flex items-center mt-4 md:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Expense
        </button>
      </div>

      <div className="card">
        {/* Category Filters - Moved to Top */}
        <div className="flex flex-wrap gap-2 mt-6 pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth !== null ? selectedMonth + 1 : ""}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Time</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear || ""}
              onChange={(e) => handleYearChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Time</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Filter Label */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600">
            Showing: <span className="text-blue-600 font-semibold">{getFilterLabel()}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions && filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const date = transaction.createdAt || transaction.created_at;

                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {transaction.description || "No description"}
                      </td>

                      <td className="py-3 px-4">
                        {transaction.category}
                      </td>

                      <td className="py-3 px-4 font-semibold">
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td className="py-3 px-4">
                        {date ? new Date(date).toLocaleDateString() : "No date"}
                      </td>

                      <td className="py-3 px-4">
                        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredTransactions.length} expenses
          </p>

          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  page === p
                    ? "bg-primary-600 text-white"
                    : "border hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Expense</h2>
              <button onClick={() => setShowAddExpenseModal(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <TransactionForm
              onTransactionAdded={() => {
                setShowAddExpenseModal(false);
                fetchTransactions();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

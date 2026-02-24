import React, { useState, useEffect } from 'react';
import api from "../api/axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryData {
  category: string;
  total: number;
}

interface WeeklyData {
  day: string;
  total: number;
}

interface AnalyticsData {
  monthly: MonthlyData[];
  categories: CategoryData[];
  weekly: WeeklyData[];
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        const response = await api.get(
          `/api/analytics/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}` 
            }
          }
        );

        setAnalytics(response.data.data);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getCategoryColors = (index: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#F97316'];
    return colors[index % colors.length];
  };

  // Use analytics data directly from backend
  const monthlyData: {
    month: string;
    income: number;
    expense: number;
    net: number;
  }[] = analytics?.monthly || [];
  const categoryData: CategoryData[] = analytics?.categories || [];

  // ===== Financial Health Core Logic =====

  const totalIncome = monthlyData.reduce(
    (sum: number, m) => sum + m.income,
    0
  );

  const totalExpense = monthlyData.reduce(
    (sum: number, m) => sum + m.expense,
    0
  );

  const netSavings = totalIncome - totalExpense;

  const savingsRate =
    totalIncome > 0
      ? parseFloat(
          ((netSavings / totalIncome) * 100).toFixed(2)
        )
      : 0;

  // Score based mainly on savings rate
  let healthScore = 0;

  if (savingsRate >= 40) healthScore = 95;
  else if (savingsRate >= 30) healthScore = 85;
  else if (savingsRate >= 20) healthScore = 75;
  else if (savingsRate >= 10) healthScore = 60;
  else if (savingsRate >= 0) healthScore = 45;
  else healthScore = 25;

  const roundedScore = Math.round(healthScore);

  // Status label
  let status = "";
  let color = "";

  if (roundedScore >= 85) {
    status = "Excellent Financial Discipline";
    color = "text-emerald-500";
  } else if (roundedScore >= 70) {
    status = "Healthy & Stable";
    color = "text-green-500";
  } else if (roundedScore >= 50) {
    status = "Moderate Control";
    color = "text-yellow-500";
  } else {
    status = "Needs Attention";
    color = "text-red-500";
  }

  // Smart insight logic
  const highestCategory = categoryData.length > 0
    ? categoryData.reduce((prev: CategoryData, current: CategoryData) =>
        prev.total > current.total ? prev : current
      )
    : null;

  let insightMessage = "";

  if (totalExpense > totalIncome) {
    insightMessage = "Your expenses are higher than your income. Consider reducing discretionary spending.";
  } else if (highestCategory) {
    insightMessage = `Your highest spending category is ${highestCategory.category}. Monitor this category to optimize savings.`;
  } else {
    insightMessage = "You are managing your finances well. Keep tracking your expenses!";
  }

  const formattedMonthlyData = monthlyData.map((item: MonthlyData) => ({
    month: item.month,
    Income: item.income,
    Expense: item.expense,
    Net: item.income - item.expense
  }));

  if (!analytics) return <div>Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Financial Analytics
      </h1>

      <div className="mb-10">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">₹{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Expense</p>
                <p className="text-2xl font-bold text-red-500 mt-2">₹{totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Net Savings</p>
                <p className="text-2xl font-bold text-green-600 mt-2">₹{netSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Savings Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{savingsRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income vs Expenses Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Income vs Expenses</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Amount']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Bar dataKey="Income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Net" name="Net" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Income</span>
                <span className="font-semibold text-blue-600">₹{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Expense</span>
                <span className="font-semibold text-red-500">₹{totalExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Net Savings</span>
                <span className="font-semibold text-green-600">₹{netSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Savings Rate</span>
                <span className="font-semibold text-purple-600">{savingsRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Financial Health Score
            </h2>
            <p className={`text-5xl font-bold ${color}`}>
              {roundedScore}/100
            </p>
            <p className={`mt-2 font-medium ${color}`}>
              {status}
            </p>
            <p className="text-gray-500 mt-3">
              Savings Rate: {savingsRate}%
            </p>
            <p className="text-gray-500">
              Net Savings: ₹{netSavings.toLocaleString()}
            </p>
          </div>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={
                  2 * Math.PI * 60 *
                  (1 - roundedScore / 100)
                }
                className={`${color} transition-all duration-700 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
              {roundedScore}%
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        {/* Monthly Spending Pattern */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Monthly Spending Pattern</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expense" fill="#EF4444" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-10">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Expense Distribution by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={400} height={300}>
                <Pie
                  data={analytics?.categories || []}
                  dataKey="total"
                  nameKey="category"
                  outerRadius={100}
                  label
                >
                  {analytics?.categories?.map((entry: CategoryData, index: number) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColors(index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {categoryData.map((category: CategoryData) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: getCategoryColors(categoryData.indexOf(category)) }} />
                  <span className="text-gray-700">{category.category}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-3">₹{category.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Insight Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Smart Insight
        </h3>
        <p className="text-gray-600">
          {insightMessage}
        </p>
      </div>
    </div>
  );
};

export default Analytics;
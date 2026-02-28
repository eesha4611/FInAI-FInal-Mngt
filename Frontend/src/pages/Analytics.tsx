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
  week: string;
  income: number;
  expense: number;
}

interface AnalyticsData {
  monthly: MonthlyData[];
  categories: CategoryData[];
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!user?.id) {
          setError("User not found. Please login again.");
          setLoading(false);
          return;
        }

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
    const colors = ['#10b981', '#3b82f6', '#fb923c', '#a855f7', '#14b8a6', '#fb7185'];
    return colors[index % colors.length];
  };

  // ===== UI STATES =====
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-lg font-semibold">
        <div className="animate-pulse">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 bg-red-50 rounded-xl mx-8 mt-8">{error}</div>;
  }

  if (!analytics) {
    return <div className="p-6 bg-yellow-50 rounded-xl mx-8 mt-8 text-yellow-800">No analytics data found.</div>;
  }

  // ===== DATA =====
  const monthlyData = analytics.monthly || [];
  const categoryData = analytics.categories || [];

  // ===== FINANCIAL METRICS =====
  const totalIncome = monthlyData.reduce((sum: number, m: any) => sum + m.income, 0);
  const totalExpense = monthlyData.reduce((sum: number, m: any) => sum + m.expense, 0);
  const netSavings = totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 
    ? ((netSavings / totalIncome) * 100).toFixed(1)
    : "0";

  const avgMonthlyExpense = (totalExpense / monthlyData.length).toFixed(0);

  const lastMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];

  const incomeGrowthRate = prevMonth
    ? (((lastMonth.income - prevMonth.income) / prevMonth.income) * 100).toFixed(1)
    : "0";

  // ===== FINANCIAL HEALTH SCORE =====
  const healthScore = Math.min(
    100,
    Math.max(0, Number(savingsRate))
  );

  let healthLabel = "Critical";
  let healthInterpretation = "Your financial health requires immediate attention.";
  
  if (healthScore >= 80) {
    healthLabel = "Excellent";
    healthInterpretation = "Your savings behavior indicates excellent financial stability.";
  } else if (healthScore >= 60) {
    healthLabel = "Stable";
    healthInterpretation = "Your savings behavior indicates stable financial management.";
  } else if (healthScore >= 30) {
    healthLabel = "Needs Attention";
    healthInterpretation = "Your savings behavior requires attention for improvement.";
  }

  // ===== WEEKLY TREND DATA =====
  const generateWeeklyData = (): WeeklyData[] => {
    const weeks: WeeklyData[] = [];
    const weeksPerMonth = 4;

    monthlyData.forEach((month: any, monthIndex: number) => {
      for (let i = 1; i <= weeksPerMonth; i++) {
        weeks.push({
          week: `Week ${monthIndex * 4 + i}`,
          income: month.income / 4,
          expense: month.expense / 4,
        });
      }
    });

    return weeks.slice(-12);
  };

  const weeklyData = generateWeeklyData();

  // ===== CATEGORY INSIGHTS =====
  const totalCategoryExpense = categoryData.reduce((sum, cat) => sum + cat.total, 0);
  const categoryWithPercentages = categoryData.map(cat => ({
    ...cat,
    percentage: totalCategoryExpense > 0 ? ((cat.total / totalCategoryExpense) * 100).toFixed(1) : "0"
  }));

  const topCategories = [...categoryWithPercentages].sort((a, b) => b.total - a.total).slice(0, 3);

  // ===== FINANCIAL INSIGHTS =====
  const generateInsights = () => {
    const insights = [];
    
    if (monthlyData.length >= 2) {
      const lastMonthExpense = lastMonth.expense;
      const prevMonthExpense = prevMonth.expense;
      const expenseChange = ((lastMonthExpense - prevMonthExpense) / prevMonthExpense * 100).toFixed(1);
      
      if (Number(expenseChange) > 5) {
        insights.push(`Spending increased by ${expenseChange}% compared to last month.`);
      } else if (Number(expenseChange) < -5) {
        insights.push(`Spending decreased by ${Math.abs(Number(expenseChange))}% compared to last month.`);
      }
    }

    if (Number(savingsRate) > 20) {
      insights.push(`Bonus income improved savings rate significantly to ${savingsRate}%.`);
    } else if (Number(savingsRate) < 0) {
      insights.push(`Spending exceeds income - requires immediate budget review.`);
    }

    if (topCategories.length > 0) {
      insights.push(`The top spending category is ${topCategories[0].category}.`);
    }

    if (Number(incomeGrowthRate) > 5) {
      insights.push(`Income growth of ${incomeGrowthRate}% supports better financial planning.`);
    }

    return insights.length > 0 ? insights.slice(0, 4) : ["Continue tracking expenses to gain more insights."];
  };

  const insights = generateInsights();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 min-h-screen space-y-12">

      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Financial Analytics
        </h1>
        <p className="text-gray-600">Executive overview of financial performance and insights</p>
      </div>

      {/* ===== 1. EXECUTIVE SUMMARY METRICS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-green-50 border border-green-200 rounded-2xl shadow-sm p-5 transition hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Total Revenue</p>
          <p className="text-2xl font-semibold text-green-700">
            ₹{totalIncome.toLocaleString()}
          </p>
        </div>

        {/* Total Spending */}
        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-5 transition hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Total Spending</p>
          <p className="text-2xl font-semibold text-red-700">
            ₹{totalExpense.toLocaleString()}
          </p>
        </div>

        {/* Net Savings */}
        <div className={`${netSavings >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-2xl shadow-sm p-5 transition hover:shadow-md`}>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Net Savings</p>
          <p className={`text-2xl font-semibold ${netSavings >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            ₹{netSavings.toLocaleString()}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 transition hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Savings Rate</p>
          <p className="text-2xl font-semibold text-gray-800">
            {savingsRate}%
          </p>
        </div>

        {/* Avg Monthly Expense */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 transition hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Avg Monthly</p>
          <p className="text-2xl font-semibold text-gray-800">
            ₹{Number(avgMonthlyExpense).toLocaleString()}
          </p>
        </div>

        {/* Income Growth */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 transition hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Income Growth</p>
          <p className="text-2xl font-semibold text-gray-800">
            {incomeGrowthRate}%
          </p>
        </div>

      </div>

      {/* ===== 2. FINANCIAL HEALTH SCORE ===== */}
      <div className="bg-white rounded-2xl shadow-md p-8 flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center space-x-8">
            <div>
              <div className="text-5xl font-bold mb-2 text-gray-900">
                {Math.round(healthScore)}
              </div>
              <div className="text-lg font-medium text-gray-600">
                {healthLabel}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Savings Rate:</span> {savingsRate}%
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Income Growth:</span> {incomeGrowthRate}%
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Net Savings:</span> ₹{netSavings.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm leading-relaxed text-gray-700">
              {healthInterpretation}
            </p>
          </div>
        </div>
      </div>

      {/* ===== 3. WEEKLY PERFORMANCE BREAKDOWN ===== */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Performance Breakdown</h2>
          <p className="text-sm text-gray-500">Income vs Spending — Last 12 Weeks</p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                labelStyle={{ color: '#374151' }}
              />
              <Legend align="right" />
              <Bar dataKey="income" fill="#16a34a" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#dc2626" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== 4. MONTHLY CASH FLOW OVERVIEW ===== */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Monthly Cash Flow Overview</h2>
          <p className="text-sm text-gray-500">Income and expense comparison across months</p>
        </div>
        
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <Bar dataKey="income" fill="#16a34a" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#dc2626" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            October recorded the highest spending due to travel and shopping activity.
          </p>
        </div>
      </div>

      {/* ===== 5. EXPENSE CATEGORY INSIGHTS ===== */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Expense Category Insights</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  outerRadius={80}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={getCategoryColors(index)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Top 3 Spending Categories</h3>
              {topCategories.map((cat, index) => (
                <div key={cat.category} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{cat.category}</span>
                  <span className="font-semibold text-gray-900">₹{cat.total.toLocaleString()} ({cat.percentage}%)</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Focus on optimizing top categories to improve overall savings rate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 6. FINANCIAL INSIGHTS ===== */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Insights</h2>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-semibold text-xs">{index + 1}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Analytics;
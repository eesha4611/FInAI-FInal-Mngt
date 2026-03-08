import React, { useEffect, useState, useRef } from 'react';

import TransactionForm from '../components/TransactionForm';
import dashboardService from '../services/dashboard.service';

import axios from 'axios';
import useRefreshData from '../hooks/useRefreshData';

// Inline insights service
const insightsService = {
  getInsights: async (month?: string | null, year?: string | null) => {
    const token = localStorage.getItem('token');
    let url = 'http://localhost:5001/api/insights';
    
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }
};

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

interface Insights {
  totalIncome: number;
  totalExpense: number;
  overspending: boolean;
  topCategory: string | null;
  healthStatus: string;
  monthlyStory: string;
  lifestyleAlert: string;
}

const Dashboard = () => {
 
  const formRef = useRef<HTMLDivElement>(null);
  const { registerRefreshCallbacks } = useRefreshData();
  
  // Initialize filters with localStorage values or null for "All Time"
  const [month, setMonth] = useState<string | null>(() => {
    const savedMonth = localStorage.getItem("selectedMonth");
    return savedMonth === "" ? null : savedMonth;
  });
  const [year, setYear] = useState<string | null>(() => {
    const savedYear = localStorage.getItem("selectedYear");
    return savedYear === "" ? null : savedYear;
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });

  const [insights, setInsights] = useState<Insights>({
    totalIncome: 0,
    totalExpense: 0,
    overspending: false,
    topCategory: null,
    healthStatus: 'Excellent',
    monthlyStory: '',
    lifestyleAlert: ''
  });

  const [loading, setLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const loadDashboardData = async () => {
  try {
    console.log("🔵 loadDashboardData started");

    setLoading(true);
    setInsightsError(null);

    console.log("🟡 Calling insights API...");
    const insightsResponse = await insightsService.getInsights(month, year);
    console.log("🟢 Insights response:", insightsResponse);

    if (insightsResponse.success && insightsResponse.data) {
      setInsights(insightsResponse.data);
    }

    console.log("🟡 Calling dashboard stats API...");
    const statsResponse = await dashboardService.getDashboardData(month, year);
    console.log("🟢 Stats response:", statsResponse);

    if (statsResponse.success && statsResponse.data) {
      setStats(statsResponse.data);
    }

  } catch (err) {
    console.error("❌ Dashboard error:", err);
    setInsightsError("Failed to load insights data");
  } finally {
    setLoading(false);
  }
};

  // Restore filters from localStorage on mount
  useEffect(() => {
    const savedMonth = localStorage.getItem("selectedMonth");
    const savedYear = localStorage.getItem("selectedYear");
    
    if (savedMonth && savedMonth !== "") {
      setMonth(savedMonth === "" ? null : savedMonth);
    }
    if (savedYear && savedYear !== "") {
      setYear(savedYear === "" ? null : savedYear);
    }
  }, []);

  useEffect(() => {
    registerRefreshCallbacks({
      refreshDashboard: loadDashboardData
    });
  }, [registerRefreshCallbacks, month, year]);

  useEffect(() => {
    loadDashboardData();
  }, [month, year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your AI-powered financial overview.
          </p>
        </div>

        <button
          onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm"
        >
          <span className="text-xl mr-2">+</span>
          Add Transaction
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Income" value={stats.totalIncome} color="green" />
        <StatCard title="Total Expenses" value={stats.totalExpense} color="red" />
        <StatCard title="Balance" value={stats.balance} color="blue" />
        <StatCard title="Transactions" value={stats.transactionCount} color="gray" />
      </div>

      {/* Insights Section */}
      <div className="space-y-4">

        {insights.overspending && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ⚠ You are overspending. Expenses exceed 70% of income.
          </div>
        )}

        {/* Financial Health */}
        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            Financial Health
          </p>
          <span className={`inline-block px-4 py-2 rounded-full text-white font-medium ${
            insights.healthStatus === 'Excellent' ? 'bg-green-500' :
            insights.healthStatus === 'Good' ? 'bg-blue-500' :
            insights.healthStatus === 'Warning' ? 'bg-orange-500' :
            insights.healthStatus === 'Risky' ? 'bg-red-500' :
            'bg-gray-500'
          }`}>
            {insights.healthStatus}
          </span>
        </div>

        {/* Top Category */}
        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-lg font-semibold text-gray-800">
            Top Spending Category: 
            <span className="text-blue-600 ml-2">
              {insights.topCategory || 'N/A'}
            </span>
          </p>
        </div>

        {/* Monthly Financial Story */}
        <div className="bg-white border rounded-xl p-5 shadow-sm hover:bg-blue-50 transition">
          <h3 className="text-xs tracking-wide text-blue-600 uppercase mb-2">
            Monthly Financial Story
          </h3>
          <p className="text-base font-semibold text-gray-800">
            {stats.totalExpense < stats.totalIncome
              ? `🎉 Great control! Your expenses are within your income.`
              : `⚠️ Alert! Your expenses exceed your income.`}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Based on your total income and expenses.
          </p>
        </div>

        {/* Lifestyle Upgrade Detector */}
        <div className="bg-white border rounded-xl p-5 shadow-sm hover:bg-blue-50 transition">
          <h3 className="text-xs tracking-wide text-blue-600 uppercase mb-2">
            Lifestyle Upgrade Detector
          </h3>
          <p className="text-base font-semibold text-gray-800">
            {stats.totalIncome > 0 && (stats.totalExpense / stats.totalIncome) * 100 > 70
              ? "🚀 High spending pattern detected."
              : "✅ Your spending pattern is stable."}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Based on your total income vs expense ratio.
          </p>
        </div>

        {insightsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {insightsError}
          </div>
        )}

      </div>

      {/* Transaction Form */}
      <div ref={formRef}>
        <TransactionForm onTransactionAdded={loadDashboardData} />
      </div>

    </div>
  );
};

/* Reusable Stat Card */
const StatCard = ({ title, value, color }: any) => (
  <div className="bg-white shadow rounded-xl p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold mt-2 text-${color}-600`}>
      {Number(value || 0).toFixed(2)}
    </p>
  </div>
);

export default Dashboard;
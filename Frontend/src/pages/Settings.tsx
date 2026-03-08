import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cog6ToothIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useBudget } from '../context/BudgetContext';
import { useExpenseFilter } from '../context/ExpenseFilterContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { 
    monthlyBudget, 
    setMonthlyBudget, 
    categoryBudgets, 
    setCategoryBudgets,
    updateBudget, 
    expenses
  } = useBudget();
  
  // Use global filter context
  const { selectedMonth, selectedYear } = useExpenseFilter();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    anomalies: true,
    predictions: true,
    weeklyReport: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [notifyAt, setNotifyAt] = useState(80);

  const privacySettings = [
    { id: 'dataCollection', label: 'Allow data collection for AI improvements', enabled: true },
    { id: 'analytics', label: 'Share anonymous usage analytics', enabled: true },
    { id: 'peerComparison', label: 'Compare my spending with peers (anonymous)', enabled: false },
    { id: 'autoBackup', label: 'Auto-backup data to cloud', enabled: true },
  ];

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyToggle = (id: string) => {
    // In real app, this would update backend
    console.log(`Toggled ${id}`);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
    
    console.log('Logged out successfully');
  };

  const saveBudgetSettings = async () => {
    const success = await updateBudget({
      monthlyBudget,
      categoryBudgets
    });
    
    if (success) {
      setSaveMessage('Budget updated successfully');
    } else {
      setSaveMessage('Failed to update budget');
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleCategoryBudgetChange = (category: string, value: number) => {
    setCategoryBudgets((prev: Record<string, number>) => ({
      ...prev,
      [category]: value
    }));
  };

  const getMonthlyCategorySpent = (category: string) => {
    console.log("SETTINGS EXPENSES:", expenses);
    console.log("FILTER:", selectedMonth, selectedYear);
    
    if (!expenses) return 0;
    
    return expenses
      .filter(e => {
        // Use the correct date field - try both possible field names
        const dateField = e.date || e.createdAt || e.created_at;
        if (!dateField) {
          console.log("No date field found for expense:", e);
          return false;
        }
        const expenseDate = new Date(dateField);
        console.log("Checking expense:", e.category, dateField, expenseDate.getMonth(), expenseDate.getFullYear());
        return (
          e.category === category &&
          selectedMonth !== null &&
          selectedYear !== null &&
          expenseDate.getMonth() === selectedMonth &&
          expenseDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // Force recalculation when filters change
  useEffect(() => {
    console.log("Recalculating category budgets...");
    console.log("Current filter:", selectedMonth, selectedYear);
    console.log("Expenses available:", expenses?.length || 0);
  }, [expenses, selectedMonth, selectedYear]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and application preferences</p>
        </div>
        <div className="p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
          <Cog6ToothIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Account Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Budget Settings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget Settings</h2>
              <p className="text-gray-600">Manage your monthly spending limits and category budgets</p>
            </div>
            
            <div className="space-y-8">
              {/* Monthly Budget Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Monthly Budget
                </label>
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg font-medium">₹</span>
                  </div>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Set your total monthly spending limit.
                </p>
              </div>
              
              {/* Budget Alert Threshold */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Budget Alert Threshold
                </label>
                <div className="flex flex-wrap gap-3">
                  {[50, 60, 70, 80, 90, 100].map((threshold) => (
                    <button
                      key={threshold}
                      onClick={() => setNotifyAt(threshold)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        notifyAt === threshold
                          ? 'bg-blue-600 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Receive notification when spending reaches this percentage of your budget."
                    >
                      {threshold}%
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Receive notification when spending reaches this percentage of your budget.
                </p>
              </div>
              
              {/* Category Budgets */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Category Budgets</h3>
                <div className="space-y-3">
                  {[
                    { key: 'food', name: 'Food & Dining' },
                    { key: 'shopping', name: 'Shopping' },
                    { key: 'transport', name: 'Transport' },
                    { key: 'entertainment', name: 'Entertainment' },
                    { key: 'bills', name: 'Bills & Utilities' },
                    { key: 'healthcare', name: 'Healthcare' },
                    { key: 'education', name: 'Education' },
                    { key: 'other', name: 'Other' }
                  ].map((category) => {
                    const budget = categoryBudgets[category.key] || 0;
                    const spent = getMonthlyCategorySpent(category.key);
                    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                    
                    // Progress bar color logic
                    let progressColor = 'bg-green-500';
                    if (percentage >= 100) {
                      progressColor = 'bg-red-500';
                    } else if (percentage >= 70) {
                      progressColor = 'bg-orange-500';
                    }
                    
                    return (
                      <div key={category.key} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{category.name}</h4>
                          <div className="relative w-32">
                            <div className="absolute inset-y-0 left-2 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">₹</span>
                            </div>
                            <input
                              type="number"
                              value={budget}
                              onChange={(e) => handleCategoryBudgetChange(category.key, Number(e.target.value))}
                              className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          ₹{spent.toFixed(0)} spent / ₹{budget.toFixed(0)} budget
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-400 ease-out ${progressColor}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        {/* Category Budget Warning */}
                        {spent > budget && budget > 0 && (
                          <div className="mt-2 flex items-center text-amber-600 text-xs">
                            <span className="mr-1">⚠</span>
                            <span>Budget exceeded</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Category Total Indicator */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Total Category Budgets:</span>
                    <span className="text-lg font-bold text-gray-900">₹{Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0)}</span>
                  </div>
                  {Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0) > monthlyBudget && monthlyBudget > 0 && (
                    <div className="mt-3 flex items-center text-amber-600 text-sm">
                      <span className="mr-2">⚠</span>
                      <span>Category budgets exceed monthly budget</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Save Button */}
              <div className="pt-6 border-t border-gray-200">
                {saveMessage && (
                  <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
                    saveMessage.includes('successfully') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {saveMessage}
                  </div>
                )}
                <button 
                  onClick={saveBudgetSettings} 
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save Budget Settings
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="card">
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Privacy & Security</h2>
            </div>
            
            <div className="space-y-6">
              {privacySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">{setting.label}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {setting.id === 'peerComparison' 
                        ? 'Compare with other students anonymously'
                        : 'Helps improve your experience'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      defaultChecked={setting.enabled}
                      onChange={() => handlePrivacyToggle(setting.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Password
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Current password"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="New password"
                      className="input-field"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="input-field"
                    />
                  </div>
                  <button className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Notifications & Preferences */}
        <div className="space-y-8">
          {/* Notifications */}
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="h-6 w-6 text-gray-600 mr-2 flex items-center justify-center">
                🔔
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.email}
                    onChange={() => handleNotificationToggle('email')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Push Notifications</p>
                  <p className="text-sm text-gray-500">Get alerts on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.push}
                    onChange={() => handleNotificationToggle('push')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Anomaly Alerts</p>
                  <p className="text-sm text-gray-500">Get notified of unusual spending</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.anomalies}
                    onChange={() => handleNotificationToggle('anomalies')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Prediction Updates</p>
                  <p className="text-sm text-gray-500">Monthly expense predictions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.predictions}
                    onChange={() => handleNotificationToggle('predictions')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Weekly Reports</p>
                  <p className="text-sm text-gray-500">Receive weekly spending summary</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.weeklyReport}
                    onChange={() => handleNotificationToggle('weeklyReport')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Export & Data */}
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-4">Data Management</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <svg className="h-5 w-5 text-blue-600 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export All Data (CSV)
              </button>
              
              <button className="w-full p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <svg className="h-5 w-5 text-blue-600 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Request Data Report
              </button>
              
              <button className="w-full p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 text-left">
                <svg className="h-5 w-5 text-red-600 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">About FinAI Sentinel</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build Date</span>
                <span className="font-medium">Feb 10, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">Today</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  FinAI Sentinel - AI-Powered Personal Finance Management System
                </p>
                <p className="text-gray-500 mt-2">
                  Batch 05 - Major Project
                </p>
                <p className="text-gray-500">
                  Sreenidhi Institute of Science & Technology
                </p>
              </div>
            </div>
          </div>

          {/* ✅ LOGOUT SECTION - ADD THIS AT THE BOTTOM */}
          <div className="card border-red-200 bg-red-50">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-600 mr-2" />
              Account
            </h3>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Sign Out
            </button>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Securely sign out of your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
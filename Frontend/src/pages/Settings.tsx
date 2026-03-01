import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cog6ToothIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import budgetService from '../services/budget.service';

const Settings: React.FC = () => {
  const navigate = useNavigate(); // ✅ For navigation
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    anomalies: true,
    predictions: true,
    weeklyReport: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Budget settings with reactive state
  const [budgets, setBudgets] = useState({
    food: 5000,
    shopping: 3000,
    transport: 2000,
    entertainment: 1500,
    rent: 8000,
    bills: 4000,
    healthcare: 2000,
    education: 3000,
    other: 1500
  });

  const [monthlyBudget, setMonthlyBudget] = useState(25000);
  const [notifyAt, setNotifyAt] = useState(80);

  // Category data with current spending
  const categoryData = [
    { key: 'food', name: 'Food & Dining', current: 3250 },
    { key: 'shopping', name: 'Shopping', current: 2500 },
    { key: 'transport', name: 'Transport', current: 1050 },
    { key: 'entertainment', name: 'Entertainment', current: 1200 },
    { key: 'rent', name: 'Rent', current: 8000 },
    { key: 'bills', name: 'Bills & Utilities', current: 3500 },
    { key: 'healthcare', name: 'Healthcare', current: 1800 },
    { key: 'education', name: 'Education', current: 2200 },
    { key: 'other', name: 'Other', current: 1200 }
  ];
// Budget exceeded alerts
const exceededBudgets = categoryData
  .map((category) => {
    const budget = budgets[category.key as keyof typeof budgets];
    const spent = category.current;

    if (spent > budget) {
      return {
        name: category.name,
        exceededBy: spent - budget
      };
    }

    return null;
  })
  .filter(Boolean);
  // Load budget settings when component mounts
  useEffect(() => {
    const loadBudgetSettings = async () => {
      try {
        const response = await budgetService.getBudgetSettings();
        if (response.success && response.data) {
         setMonthlyBudget(Number(response.data.monthlyBudget));

setBudgets(prev => ({
  ...prev,
  ...response.data.categoryBudgets
}));

setNotifyAt(Number(response.data.alertThreshold));
          console.log('Budget settings loaded:', response.data);
        }
      } catch (error) {
        console.error('Error loading budget settings:', error);
      }
    };

    loadBudgetSettings();
  }, []);

  // Privacy settings
  const privacySettings = [
    { id: 'dataCollection', label: 'Allow data collection for AI improvements', enabled: true },
    { id: 'analytics', label: 'Share anonymous usage analytics', enabled: true },
    { id: 'peerComparison', label: 'Compare my spending with peers (anonymous)', enabled: false },
    { id: 'autoBackup', label: 'Auto-backup data to cloud', enabled: true },
  ];

  // ✅ Logout function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
    
    console.log('Logged out successfully');
  };

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

  const handleBudgetUpdate = async () => {
    setIsLoading(true);
    setSaveMessage('');
    
    try {
      const budgetData = {
        monthlyBudget,
        categoryBudgets: budgets,
        alertThreshold: notifyAt
      };

      console.log('Sending budget data:', JSON.stringify(budgetData, null, 2));

      const response = await budgetService.saveBudgetSettings(budgetData);
      
      console.log('Budget save response:', response);
      
      if (response.success) {
        // Generate notifications from exceeded budgets
        const exceededBudgets = categoryData
          .map((category) => {
            const budget = budgets[category.key as keyof typeof budgets];
            const spent = category.current;

            if (spent > budget) {
              return {
                name: category.name,
                exceededBy: spent - budget
              };
            }

            return null;
          })
          .filter(Boolean);

        // Store notifications for display in navbar
        if (exceededBudgets.length > 0) {
          localStorage.setItem("budgetAlerts", JSON.stringify(exceededBudgets));
        }
        
        setSaveMessage('Budget settings updated successfully!');
        console.log('Budget settings saved:', budgetData);
        console.log('Generated notifications:', exceededBudgets);
      } else {
        setSaveMessage(response.message || 'Failed to update budget settings');
        console.error('Budget save failed:', response);
      }
    } catch (error: any) {
      console.error('Error saving budget settings:', error);
      setSaveMessage(error.response?.data?.message || error.message || 'Error updating budget settings');
      
      // More detailed error logging
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('General error:', error.message);
      }
    } finally {
      setIsLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleBudgetChange = (category: string, value: number) => {
    setBudgets(prev => ({
      ...prev,
      [category]: value
    }));
  };

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
          <div className="card">
            <div className="flex items-center mb-6">
              <CreditCardIcon className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Budget Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Budget
                </label>
                <div className="flex items-center">
                  <span className="p-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="input-field rounded-l-none"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Set your total monthly spending limit
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notify me when budget reaches
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={notifyAt}
                      onChange={(e) => setNotifyAt(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span>60%</span>
                      <span>70%</span>
                      <span>80%</span>
                      <span>90%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      value={notifyAt}
                      onChange={(e) => setNotifyAt(Number(e.target.value))}
                      className="input-field text-center"
                    />
                  </div>
                  <span className="text-gray-600">%</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-4">Category Budgets</h3>
                <div className="space-y-4">
                  {categoryData.map((category) => {
                    const budget = budgets[category.key as keyof typeof budgets];
                    const percentage = (category.current / budget) * 100;
                    
                    // Dynamic color warnings
                    let barColor = "bg-green-500";
                    if (percentage >= 70 && percentage < 90) {
                      barColor = "bg-orange-500";
                    }
                    if (percentage >= 90) {
                      barColor = "bg-red-500";
                    }
                    
                    return (
                      <div key={category.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{category.name}</span>
                            <span className="text-gray-600">
                              ₹{category.current} / ₹{budget}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${barColor}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => handleBudgetChange(category.key, Number(e.target.value))}
                          className="ml-4 w-24 input-field"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                {saveMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    saveMessage.includes('successfully') 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {saveMessage}
                  </div>
                )}
                <button 
                  onClick={handleBudgetUpdate} 
                  disabled={isLoading}
                  className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Updating...' : 'Update Budget Settings'}
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
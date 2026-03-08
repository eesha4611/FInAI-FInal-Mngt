import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MonthProvider } from './contexts/MonthContext';
import { BudgetProvider } from './context/BudgetContext';
import { ExpenseFilterProvider } from './context/ExpenseFilterContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Predictions from './pages/Predictions';
import Anomalies from './pages/Anomalies';
import ReceiptScanner from './pages/ReceiptScanner';
import ReceiptHistory from './pages/ReceiptHistory';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import HelpSupport from './pages/HelpSupport';

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <Login />
        }
      />

      {/* PROTECTED ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="anomalies" element={<Anomalies />} />
        <Route path="scan" element={<ReceiptScanner />} />
        <Route path="receipt-history" element={<ReceiptHistory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="help" element={<HelpSupport />} />
      </Route>

    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ExpenseFilterProvider>
          <MonthProvider>
            <BudgetProvider>
              <AppRoutes />
            </BudgetProvider>
          </MonthProvider>
        </ExpenseFilterProvider>
      </AuthProvider>
      <Toaster />
    </Router>
  );
};

export default App;
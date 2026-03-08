import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

interface BudgetContextType {
  monthlyBudget: number;
  setMonthlyBudget: (value: number) => void;
  categoryBudgets: Record<string, number>;
  setCategoryBudgets: (budgets: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  expenses: any[];
  fetchBudget: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  updateBudget: (budgetData: { monthlyBudget: number; categoryBudgets: Record<string, number> }) => Promise<boolean>;
  getCategorySpent: (category: string) => number;
  getCategoryProgress: (category: string) => number;
  isOverBudget: (category: string) => boolean;
  isNearBudgetLimit: (category: string) => boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

const defaultCategories = {
  food: 0,
  transport: 0,
  entertainment: 0,
  shopping: 0,
  bills: 0,
  healthcare: 0,
  education: 0,
  rent: 0,
  other: 0
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(defaultCategories);
  const [expenses, setExpenses] = useState<any[]>([]);

  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/budget/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Budget data from context:', response.data);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setMonthlyBudget(Number(data.monthlyBudget) || 0);
        
        // Merge backend data with defaults to prevent undefined errors
        const mergedBudgets = { ...defaultCategories, ...(data.categoryBudgets || {}) };
        setCategoryBudgets(mergedBudgets);
        
        console.log('Budget loaded successfully:', { monthlyBudget: data.monthlyBudget, categoryBudgets: mergedBudgets });
      }
    } catch (error) {
      console.error("Failed to load budget:", error);
      // Set defaults on error
      setMonthlyBudget(25000);
      setCategoryBudgets(defaultCategories);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/transactions?page=1&limit=100000', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.data) {
        const transactionsArray = response.data.data.transactions || response.data.data || [];
        const expensesData = transactionsArray.filter((t: any) => t.type === 'expense');
        console.log('Raw expense data:', expensesData.slice(0, 3)); // Log first 3 expenses
        setExpenses(expensesData);
        console.log('Expenses loaded successfully:', expensesData.length);
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);
      setExpenses([]);
    }
  };

  const updateBudget = async (budgetData: { monthlyBudget: number; categoryBudgets: Record<string, number> }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/budget/settings', {
        monthlyBudget: budgetData.monthlyBudget,
        categoryBudgets: budgetData.categoryBudgets,
        alertThreshold: 80 // Default threshold
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log('Budget updated successfully:', budgetData);
        // Refresh budget data after successful update
        await fetchBudget();
        return true;
      } else {
        console.error('Budget update failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Failed to update budget:", error);
      return false;
    }
  };

  const getCategorySpent = (category: string): number => {
    const categoryKey = category.toLowerCase();
    return expenses
      .filter(expense => expense.category?.toLowerCase() === categoryKey)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const getCategoryProgress = (category: string): number => {
    const spent = getCategorySpent(category);
    const budget = categoryBudgets[category] || 0;
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  const isOverBudget = (category: string): boolean => {
    return getCategoryProgress(category) >= 100;
  };

  const isNearBudgetLimit = (category: string): boolean => {
    return getCategoryProgress(category) >= 80;
  };

  useEffect(() => {
    fetchBudget();
    fetchExpenses();
  }, []);

  const value: BudgetContextType = {
    monthlyBudget,
    setMonthlyBudget,
    categoryBudgets,
    setCategoryBudgets,
    expenses,
    fetchBudget,
    fetchExpenses,
    updateBudget,
    getCategorySpent,
    getCategoryProgress,
    isOverBudget,
    isNearBudgetLimit
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export default BudgetContext;

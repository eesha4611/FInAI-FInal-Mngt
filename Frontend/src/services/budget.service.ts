import api from './api';

export const budgetService = {
  // Save budget settings
  saveBudgetSettings: async (budgetData: {
    monthlyBudget: number;
    categoryBudgets: Record<string, number>;
    alertThreshold: number;
  }) => {
    const response = await api.post('/budget/settings', budgetData);
    return response.data;
  },

  // Get budget settings
  getBudgetSettings: async () => {
    const response = await api.get('/budget/settings');
    return response.data;
  }
};

export default budgetService;

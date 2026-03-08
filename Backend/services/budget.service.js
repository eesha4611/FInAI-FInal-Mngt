const db = require('../config/db');

// Budget settings service functions
const createOrUpdateBudgetSettings = async (userId, budgetData) => {
  const connection = await db.getConnection();
  try {
    const { monthlyBudget, categoryBudgets, alertThreshold } = budgetData;
    
    // Check if budget settings already exist for user
    const [existing] = await connection.execute(
      'SELECT id FROM budget_settings WHERE user_id = ?',
      [userId]
    );
    
    if (existing.length > 0) {
      // Update existing settings
      await connection.execute(`
        UPDATE budget_settings 
        SET monthly_budget = ?, 
            category_budgets = ?, 
            alert_threshold = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        monthlyBudget,
        JSON.stringify(categoryBudgets),
        alertThreshold,
        userId
      ]);
    } else {
      // Insert new settings
      await connection.execute(`
        INSERT INTO budget_settings 
        (user_id, monthly_budget, category_budgets, alert_threshold)
        VALUES (?, ?, ?, ?)
      `, [
        userId,
        monthlyBudget,
        JSON.stringify(categoryBudgets),
        alertThreshold
      ]);
    }
    
    return {
      success: true,
      message: 'Budget settings saved successfully'
    };
  } catch (error) {
    console.error('Error saving budget settings:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const getBudgetSettings = async (userId) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM budget_settings WHERE user_id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      // Return default settings if none exist
      return {
        monthlyBudget: 25000,
        categoryBudgets: {
          food: 5000,
          shopping: 3000,
          transport: 2000,
          entertainment: 1500,
          rent: 8000,
          bills: 4000,
          healthcare: 2000,
          education: 3000,
          other: 1500
        },
        alertThreshold: 80
      };
    }
    
    const settings = rows[0];
    
    // Try to get category budgets from JSON column first, fallback to individual columns
    let categoryBudgets;
    if (settings.category_budgets && (typeof settings.category_budgets === 'string' || typeof settings.category_budgets === 'object')) {
      categoryBudgets = typeof settings.category_budgets === "string"
        ? JSON.parse(settings.category_budgets)
        : settings.category_budgets;
    } else {
      // Fallback to individual columns
      categoryBudgets = {
        food: settings.food_dining || 0,
        shopping: settings.shopping || 0,
        transport: settings.transport || 0,
        entertainment: settings.entertainment || 0,
        rent: settings.rent || 0,
        bills: settings.bills_utilities || 0,
        healthcare: settings.healthcare || 0,
        education: settings.education || 0,
        other: settings.other || 0
      };
    }
    
    return {
      monthlyBudget: settings.monthly_budget,
      categoryBudgets: categoryBudgets,
      alertThreshold: settings.alert_threshold
    };
  } catch (error) {
    console.error('Error fetching budget settings:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrUpdateBudgetSettings,
  getBudgetSettings
};

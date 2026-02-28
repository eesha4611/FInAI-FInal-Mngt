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
    return {
  monthlyBudget: settings.monthly_budget,
  categoryBudgets:
    typeof settings.category_budgets === "string"
      ? JSON.parse(settings.category_budgets)
      : settings.category_budgets,
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

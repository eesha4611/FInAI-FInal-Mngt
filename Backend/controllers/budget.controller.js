const { createOrUpdateBudgetSettings, getBudgetSettings } = require('../services/budget.service');

const saveBudgetSettingsController = async (req, res) => {
  // Safely read user ID from JWT
  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.user?.data?.id;

  console.log("Budget save request - User ID:", userId);
  console.log("Budget save request - Body:", req.body);

  // If userId is missing, return authentication error
  if (!userId) {
    console.log("❌ Budget save failed: No user ID found");
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  try {
    const { monthlyBudget, categoryBudgets, alertThreshold } = req.body;

    // Validate required fields
    if (!monthlyBudget || !categoryBudgets || !alertThreshold) {
      console.log("❌ Budget save failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: 'Monthly budget, category budgets, and alert threshold are required',
        data: null
      });
    }

    // Validate monthly budget
    if (isNaN(monthlyBudget) || parseFloat(monthlyBudget) <= 0) {
      console.log("❌ Budget save failed: Invalid monthly budget");
      return res.status(400).json({
        success: false,
        message: 'Monthly budget must be a positive number',
        data: null
      });
    }

    // Validate alert threshold
    if (isNaN(alertThreshold) || parseFloat(alertThreshold) < 50 || parseFloat(alertThreshold) > 100) {
      console.log("❌ Budget save failed: Invalid alert threshold");
      return res.status(400).json({
        success: false,
        message: 'Alert threshold must be between 50 and 100',
        data: null
      });
    }

    // Validate category budgets
    for (const [category, budget] of Object.entries(categoryBudgets)) {
      if (isNaN(budget) || parseFloat(budget) < 0) {
        console.log(`❌ Budget save failed: Invalid category budget for ${category}`);
        return res.status(400).json({
          success: false,
          message: `Category budget for ${category} must be a positive number`,
          data: null
        });
      }
    }

    const result = await createOrUpdateBudgetSettings(userId, {
      monthlyBudget: parseFloat(monthlyBudget),
      categoryBudgets,
      alertThreshold: parseFloat(alertThreshold)
    });

    console.log(`✅ Budget settings saved for user ${userId}`);

    res.json({
      success: true,
      message: 'Budget settings saved successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Save budget settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
      data: null
    });
  }
};

const getBudgetSettingsController = async (req, res) => {
  // Safely read user ID from JWT
  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.user?.data?.id;

  console.log("Budget get request - User ID:", userId);

  // If userId is missing, return authentication error
  if (!userId) {
    console.log("❌ Budget get failed: No user ID found");
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  try {
    const settings = await getBudgetSettings(userId);

    console.log(`✅ Budget settings retrieved for user ${userId}:`, settings);

    res.json({
      success: true,
      message: 'Budget settings retrieved successfully',
      data: settings
    });
  } catch (error) {
    console.error('❌ Get budget settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
      data: null
    });
  }
};

module.exports = {
  saveBudgetSettingsController,
  getBudgetSettingsController
};

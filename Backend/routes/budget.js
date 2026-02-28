const express = require("express");
const router = express.Router();
const db = require("../config/db");

// SAVE budget settings
router.post("/settings", async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets, alertThreshold } = req.body;

    await db.query(
      "UPDATE users SET monthly_budget=?, category_budgets=?, alert_threshold=? WHERE id=1",
      [
        monthlyBudget,
        JSON.stringify(categoryBudgets),
        alertThreshold
      ]
    );

    res.json({
      success: true,
      message: "Budget saved successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET saved settings
router.get("/settings", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT monthly_budget, category_budgets, alert_threshold FROM users WHERE id=1"
    );

    if (!rows.length) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      data: {
        monthlyBudget: rows[0].monthly_budget,
        categoryBudgets: JSON.parse(rows[0].category_budgets),
        alertThreshold: rows[0].alert_threshold
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
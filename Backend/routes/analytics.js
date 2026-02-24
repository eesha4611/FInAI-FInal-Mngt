const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const db = require('../config/db');

// Apply auth middleware to all analytics routes
router.use(authMiddleware);

// GET /api/analytics/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the authenticated user is requesting their own data
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own analytics',
        data: null
      });
    }

    // Fetch monthly income vs expense using created_at
    const [monthlyData] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ? 
        AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `, [userId]);

    // Fetch category-wise expense summary
    const [categoryData] = await db.query(`
      SELECT 
        category,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ? 
        AND type = 'expense'
        AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY category
      ORDER BY total DESC
    `, [userId]);

    // Weekly expense pattern (last 7 days)
    const [weeklyData] = await db.query(`
      SELECT
        DAYNAME(created_at) as day,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DAYNAME(created_at)
    `, [userId]);

    // Sort days properly
    const daysOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

    const weekly = daysOrder.map(day => {
      const found = weeklyData.find(d => d.day === day);
      return {
        day,
        total: found ? Number(found.total) : 0
      };
    });

    // Format the response
    const monthly = monthlyData.map(row => ({
      month: row.month,
      income: Number(row.income) || 0,
      expense: Number(row.expense) || 0,
      net: (Number(row.income) || 0) - (Number(row.expense) || 0)
    }));

    const categories = categoryData.map(row => ({
      category: row.category,
      total: Number(row.total) || 0
    }));

    res.json({
      success: true,
      data: {
        monthly,
        categories,
        weekly
      }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      data: null
    });
  }
});

module.exports = router;

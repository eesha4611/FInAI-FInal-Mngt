const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Test endpoint without auth
router.get('/test', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM budget_settings LIMIT 5'
    );
    
    console.log('Budget settings rows:', rows);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Budget test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

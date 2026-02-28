const express = require('express');
const router = express.Router();
const { saveBudgetSettingsController, getBudgetSettingsController } = require('../controllers/budget.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/budget/settings - Save budget settings
router.post('/settings', authMiddleware, saveBudgetSettingsController);

// GET /api/budget/settings - Get budget settings
router.get('/settings', authMiddleware, getBudgetSettingsController);

module.exports = router;

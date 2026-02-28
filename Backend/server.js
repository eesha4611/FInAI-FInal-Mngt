require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.route');
const messageRoutes = require('./routes/message.route');
const authRoutes = require('./routes/auth.route');
const profileRoutes = require('./routes/profile.route');
const dashboardRoutes = require('./routes/dashboard.route');
const transactionRoutes = require('./routes/transaction.routes');
const categorySummaryRoutes = require('./routes/category-summary.route');
const insightsRoutes = require('./routes/insightsRoutes');
const userRoutes = require('./routes/userRoutes');
const expensesRoutes = require('./routes/expensesRoutes');
const budgetRoutes = require('./routes/budget-complex');
console.log("✅ category summary route loaded");
console.log("✅ insights routes loaded");
console.log("✅ user routes loaded");
console.log("✅ expenses routes loaded");
console.log("✅ budget routes loaded");



// Import database connection AFTER dotenv is loaded
const db = require('./config/db');
const sequelize = require('./models').sequelize;

// Test MySQL connection
db.getConnection()
  .then(connection => {
    console.log('✅ MySQL connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err);
  });

// Sync Sequelize models
sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Sequelize models synced');
  })
  .catch(err => {
    console.error('❌ Sequelize sync failed:', err);
  });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api', messageRoutes);
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/profile', profileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transactions', categorySummaryRoutes);
app.use('/api/insights', insightsRoutes);
const analysisRoutes = require('./routes/analysisRoutes');
app.use('/api/analysis', analysisRoutes);
const predictionRoutes = require('./routes/predictionRoutes');
app.use('/api/predictions', predictionRoutes);
const recommendationRoutes = require('./routes/recommendationRoutes');
app.use('/api/recommendations', recommendationRoutes);
const anomalyRoutes = require('./routes/anomalyRoutes');
app.use('/api/anomalies', anomalyRoutes);
const ocrRoutes = require('./routes/ocrRoutes');
app.use('/api/ocr', ocrRoutes);
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budget', budgetRoutes);

// ✅ 404 handler (NO wildcard, this is the fix)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null
  });
});

// ✅ Global error handler (must be last)
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't expose sensitive database errors
  let message = 'Internal server error';
  let statusCode = 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    statusCode = 400;
  } else if (err.code === 'ER_DUP_ENTRY') {
    message = 'Duplicate entry';
    statusCode = 409;
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    message = 'Referenced record not found';
    statusCode = 400;
  } else if (err.code === 'ER_BAD_NULL_ERROR') {
    message = 'Required field is missing';
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

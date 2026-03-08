require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Routes
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
const budgetTestRoutes = require('./routes/budget-test');

const analysisRoutes = require('./routes/analysisRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const anomalyRoutes = require('./routes/anomalyRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const analyticsRoutes = require('./routes/analytics');

// DB connections
const db = require('./config/db');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;


// =======================
// 🔌 DATABASE CONNECTION
// =======================

db.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

sequelize.sync({ alter: false })
  .then(() => {
    console.log('✅ Sequelize models synced');
  })
  .catch(err => {
    console.error('❌ Sequelize sync failed:', err.message);
  });


// =======================
// 🧩 MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());


// =======================
// 🚀 ROUTES
// =======================

app.use('/api', healthRoutes);
app.use('/api', messageRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transactions', categorySummaryRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/budget-test', budgetTestRoutes);


// =======================
// ❌ 404 HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null
  });
});


// =======================
// 🛑 GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  let status = 500;
  let message = 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Duplicate entry';
  }

  res.status(status).json({
    success: false,
    message,
    data: null
  });
});


// =======================
// ▶️ START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
require('dotenv').config();
const mysql = require('mysql2/promise');
const db = require('../config/db');

// Configuration
const TOTAL_TRANSACTIONS = 350; // Between 250-500
const ANNUAL_INCOME = 1200000; // ₹12,00,000
const MONTHLY_SALARY = 100000; // ₹1,00,000
const USER_ID = 1;

// Expense categories
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Shopping', 
  'Transport',
  'Entertainment',
  'Rent',
  'Bills',
  'Healthcare',
  'Education',
  'Other'
];

// Realistic descriptions for each category
const DESCRIPTIONS = {
  'Food & Dining': [
    'Zomato', 'Swiggy', 'Cafe Coffee Day', 'Lunch with Friends', 'Dominos Pizza',
    'Subway', 'KFC', 'McDonalds', 'Local Restaurant', 'Ice Cream',
    'Grocery Shopping', 'Vegetables', 'Fruits', 'Milk & Dairy'
  ],
  'Transport': [
    'Uber Ride', 'Ola Cab', 'Metro Recharge', 'Fuel - Petrol', 'Auto Rickshaw',
    'Bus Pass', 'Train Ticket', 'Airport Transfer', 'Parking Fee', 'Toll'
  ],
  'Shopping': [
    'Amazon Purchase', 'Flipkart Order', 'Clothes Purchase', 'Electronics', 'Mobile Phone',
    'Laptop', 'Shoes', 'Watch', 'Bag', 'Home Appliances'
  ],
  'Bills': [
    'Electricity Bill', 'Water Bill', 'Internet Bill', 'Mobile Recharge', 'Gas Bill',
    'Credit Card Bill', 'Loan EMI', 'Insurance Premium', 'Society Maintenance', 'DTH Recharge'
  ],
  'Entertainment': [
    'Netflix Subscription', 'Movie Tickets', 'Spotify Premium', 'Weekend Outing', 'Gaming',
    'Concert Tickets', 'Sports Event', 'Pub Visit', 'Club Entry', 'Party'
  ],
  'Healthcare': [
    'Pharmacy', 'Doctor Visit', 'Health Checkup', 'Dental Treatment', 'Eye Test',
    'Hospital Bill', 'Medicines', 'Health Insurance', 'Gym Membership', 'Yoga Classes'
  ],
  'Education': [
    'Books Purchase', 'Online Course', 'College Fees', 'School Fees', 'Tuition Classes',
    'Certification Exam', 'Workshop', 'Seminar', 'Study Materials', 'Library Fee'
  ],
  'Other': [
    'Groceries', 'Household Items', 'Gift Purchase', 'Donation', 'Home Repair',
    'Furniture', 'Kitchen Items', 'Personal Care', 'Travel', 'Miscellaneous'
  ]
};

// Amount ranges for each category (in rupees)
const AMOUNT_RANGES = {
  'Food & Dining': { min: 150, max: 1200 },
  'Transport': { min: 50, max: 500 },
  'Shopping': { min: 500, max: 5000 },
  'Bills': { min: 500, max: 10000 },
  'Healthcare': { min: 500, max: 8000 },
  'Education': { min: 1000, max: 50000 },
  'Entertainment': { min: 300, max: 3000 },
  'Other': { min: 200, max: 3000 },
  'Rent': { min: 10000, max: 25000 }
};

// Generate random date within last 365 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 365);
  const randomDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return randomDate;
}

// Generate random amount within range
function getRandomAmount(category) {
  const range = AMOUNT_RANGES[category];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Generate random description for category
function getRandomDescription(category) {
  const descriptions = DESCRIPTIONS[category];
  if (!descriptions || descriptions.length === 0) {
    return 'Transaction';
  }
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Check if date is weekend (Friday-Sunday)
function isWeekend(date) {
  const day = date.getDay();
  return day === 5 || day === 6 || day === 0; // 5=Friday, 6=Saturday, 0=Sunday
}

// Generate transactions
async function generateTransactions() {
  console.log('🚀 Starting transaction generation...');
  
  const transactions = [];
  let totalExpenses = 0;
  
  // Generate monthly income transactions (12 months)
  for (let month = 0; month < 12; month++) {
    const incomeDate = new Date();
    incomeDate.setMonth(incomeDate.getMonth() - month, 1); // 1st of each month
    
    transactions.push({
      user_id: USER_ID,
      amount: MONTHLY_SALARY,
      type: 'income',
      category: 'Salary',
      description: 'Salary Credit',
      created_at: incomeDate
    });
  }
  
  // Generate expense transactions
  const expenseCount = TOTAL_TRANSACTIONS - 12; // Subtract income transactions
  
  for (let i = 0; i < expenseCount; i++) {
    const category = EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)];
    const date = getRandomDate();
    let amount = getRandomAmount(category);
    
    // Weekend boost for Food & Entertainment
    if (isWeekend(date) && (category === 'Food & Dining' || category === 'Entertainment')) {
      amount = Math.floor(amount * 1.3); // 30% higher on weekends
    }
    
    totalExpenses += amount;
    
    transactions.push({
      user_id: USER_ID,
      amount: amount,
      type: 'expense',
      category: category,
      description: getRandomDescription(category),
      created_at: date
    });
  }
  
  // Ensure expenses are less than income (financial constraint)
  const targetExpenses = ANNUAL_INCOME * 0.65; // Around ₹7.8 lakhs (65% of income)
  const adjustmentFactor = targetExpenses / totalExpenses;
  
  // Adjust amounts to meet financial constraints
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      transaction.amount = Math.floor(transaction.amount * adjustmentFactor);
    }
  });
  
  // Shuffle transactions for random distribution
  transactions.sort(() => Math.random() - 0.5);
  
  console.log(`📊 Generated ${transactions.length} transactions`);
  console.log(`💰 Total Income: ₹${(12 * MONTHLY_SALARY).toLocaleString()}`);
  console.log(`💸 Total Expenses: ₹${Math.floor(transactions.reduce((sum, t) => 
    sum + (t.type === 'expense' ? t.amount : 0), 0)).toLocaleString()}`);
  
  return transactions;
}

// Insert transactions into database
async function insertTransactions(transactions) {
  console.log('💾 Inserting transactions into database...');
  
  const connection = await db.getConnection();
  
  try {
    // Clear existing transactions for user_id = 1
    await connection.execute('DELETE FROM transactions WHERE user_id = ?', [USER_ID]);
    console.log('🗑️ Cleared existing transactions');
    
    // Insert new transactions
    const insertQuery = `
      INSERT INTO transactions (user_id, amount, type, category, description, created_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    for (const transaction of transactions) {
      await connection.execute(insertQuery, [
        transaction.user_id,
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.description,
        transaction.created_at
      ]);
    }
    
    console.log(`✅ Successfully inserted ${transactions.length} transactions`);
    
  } catch (error) {
    console.error('❌ Error inserting transactions:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Main execution function
async function main() {
  try {
    console.log('🎯 FinAI Sentinel Transaction Generator');
    console.log('=====================================');
    
    const transactions = await generateTransactions();
    await insertTransactions(transactions);
    
    console.log('🎉 Transaction generation completed successfully!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateTransactions, insertTransactions };

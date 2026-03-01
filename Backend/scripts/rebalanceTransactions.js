const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finai_sentinel'
};

// Category spending rules
const categoryRules = {
  'Food & Dining': { min: 100, max: 800, frequency: 'high' },
  'Transport': { min: 50, max: 500, frequency: 'high' },
  'Shopping': { min: 500, max: 5000, frequency: 'medium' },
  'Entertainment': { min: 200, max: 2000, frequency: 'medium' },
  'Bills': { min: 500, max: 5000, frequency: 'medium' },
  'Healthcare': { min: 500, max: 8000, frequency: 'low' },
  'Education': { min: 1000, max: 50000, frequency: 'very_low', maxCount: 3 },
  'Rent': { min: 5000, max: 25000, frequency: 'low' },
  'Other': { min: 200, max: 3000, frequency: 'low' }
};

// Helper function to generate random number between min and max
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to check if a date is a weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday (0) or Saturday (6)
}

// Helper function to check if date is in first week of month
function isFirstWeekOfMonth(date) {
  return date.getDate() <= 7;
}

// Helper function to generate realistic date based on category
function generateRealisticDate(category) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
  const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
  const date = new Date(randomTime);
  
  // Bills mostly in first week of month
  if (category === 'Bills' && Math.random() < 0.7) {
    date.setDate(randomBetween(1, 7));
  }
  
  return date;
}

// Helper function to format date for MySQL
function formatDateForMySQL(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Rebalances transactions to create realistic financial data
 */
async function rebalanceTransactions() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    await connection.beginTransaction();
    
    // Get all current transactions
    const [transactions] = await connection.execute(
      'SELECT id, category, amount, description, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [1]
    );
    
    if (transactions.length === 0) {
      console.log('No transactions found to rebalance.');
      await connection.rollback();
      return { updated: 0, total: 0 };
    }
    
    console.log(`Found ${transactions.length} transactions to rebalance...`);
    
    let updateCount = 0;
    const categoryCounts = {};
    
    // Count transactions by category
    transactions.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    
    console.log('Current category distribution:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    
    // Update each transaction
    for (const transaction of transactions) {
      const rule = categoryRules[transaction.category];
      if (!rule) continue;
      
      let newAmount = transaction.amount;
      let newDescription = transaction.description;
      const oldDate = new Date(transaction.created_at);
      const weekend = isWeekend(oldDate);
      
      // Reduce extremely large transactions (> ₹20,000)
      if (transaction.amount > 20000) {
        newAmount = randomBetween(2000, 15000);
        console.log(`Reduced large transaction: ID ${transaction.id} from ₹${transaction.amount} to ₹${newAmount}`);
        updateCount++;
      }
      // Apply category spending rules
      else {
        // Weekend spending slightly higher
        let amountRange = { min: rule.min, max: rule.max };
        if (weekend && Math.random() < 0.6) {
          amountRange.min = Math.floor(rule.min * 1.2);
          amountRange.max = Math.floor(rule.max * 1.3);
        }
        
        // Special handling for Education (keep only 1-3 transactions)
        if (transaction.category === 'Education') {
          if (categoryCounts['Education'] > 3) {
            // Mark excess education transactions for deletion/reduction
            newAmount = randomBetween(1000, 3000);
            newDescription = 'Educational Material';
            console.log(`Reduced excess education transaction: ID ${transaction.id} from ₹${transaction.amount} to ₹${newAmount}`);
            updateCount++;
          }
        } else {
          // Apply category-specific amount ranges
          newAmount = randomBetween(amountRange.min, amountRange.max);
          
          // Check if amount needs updating
          if (newAmount !== transaction.amount) {
            console.log(`Updated ${transaction.category}: ID ${transaction.id} from ₹${transaction.amount} to ₹${newAmount}`);
            updateCount++;
          }
        }
      }
      
      // Generate realistic date if needed
      let newDate = oldDate;
      if (transaction.category === 'Bills' && Math.random() < 0.5) {
        newDate = generateRealisticDate('Bills');
      }
      
      // Update the transaction
      await connection.execute(
        'UPDATE transactions SET amount = ?, description = ?, created_at = ? WHERE id = ? AND user_id = ?',
        [newAmount, newDescription, formatDateForMySQL(newDate), transaction.id, 1]
      );
    }
    
    // Commit the transaction
    await connection.commit();
    
    console.log(`Transactions successfully rebalanced for realistic financial data!`);
    console.log(`Updated ${updateCount} transactions`);
    
    // Get updated summary
    const [summary] = await connection.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(amount) as total_amount,
        category,
        COUNT(*) as count
       FROM transactions 
       WHERE user_id = ? 
       GROUP BY category 
       ORDER BY count DESC`,
      [1]
    );
    
    console.log('\nUpdated Category Distribution:');
    console.log('----------------------------');
    summary.forEach(row => {
      console.log(`${row.category.padEnd(20)} | Count: ${row.count.toString().padStart(4)} | Total: ₹${row.total_amount.toLocaleString()}`);
    });
    
    const [totalSummary] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(amount) as total_amount FROM transactions WHERE user_id = ?',
      [1]
    );
    
    const total = totalSummary[0];
    console.log('\nOverall Summary:');
    console.log('----------------');
    console.log(`Total Transactions: ${total.total}`);
    console.log(`Total Expenses: ₹${total.total_amount.toLocaleString()}`);
    console.log(`Average per Transaction: ₹${Math.round(total.total_amount / total.total).toLocaleString()}`);
    
    // Calculate estimated monthly expenses
    const estimatedMonthly = total.total_amount / 12;
    console.log(`Estimated Monthly: ₹${Math.round(estimatedMonthly).toLocaleString()}`);
    
    return {
      updated: updateCount,
      total: total.total,
      totalAmount: total.total_amount,
      estimatedMonthly: Math.round(estimatedMonthly),
      categorySummary: summary
    };
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error rebalancing transactions:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

/**
 * Alternative function that completely regenerates transactions with realistic patterns
 */
async function regenerateRealisticTransactions() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    await connection.beginTransaction();
    
    // Clear existing transactions
    await connection.execute('DELETE FROM transactions WHERE user_id = ?', [1]);
    console.log('Cleared existing transactions...');
    
    const newTransactions = [];
    const targetMonthlyExpense = randomBetween(15000, 60000);
    const targetYearlyExpense = targetMonthlyExpense * 12;
    
    console.log(`Generating realistic transactions with target yearly expense: ₹${targetYearlyExpense.toLocaleString()}`);
    
    // Generate transactions based on frequency rules
    Object.entries(categoryRules).forEach(([category, rule]) => {
      let count;
      
      switch (rule.frequency) {
        case 'very_high':
          count = randomBetween(150, 200);
          break;
        case 'high':
          count = randomBetween(80, 120);
          break;
        case 'medium':
          count = randomBetween(30, 60);
          break;
        case 'low':
          count = randomBetween(10, 25);
          break;
        case 'very_low':
          count = randomBetween(1, rule.maxCount || 3);
          break;
        default:
          count = randomBetween(20, 40);
      }
      
      // Generate transactions for this category
      for (let i = 0; i < count; i++) {
        const date = generateRealisticDate(category);
        const weekend = isWeekend(date);
        
        let amountRange = { min: rule.min, max: rule.max };
        if (weekend && Math.random() < 0.6) {
          amountRange.min = Math.floor(rule.min * 1.2);
          amountRange.max = Math.floor(rule.max * 1.3);
        }
        
        const amount = randomBetween(amountRange.min, amountRange.max);
        
        // Select realistic description
        const descriptions = {
          'Food & Dining': ['Zomato', 'Swiggy', 'Restaurant', 'Coffee Shop', 'Grocery Store', 'Food Delivery'],
          'Transport': ['Uber', 'Ola', 'Metro', 'Auto Rickshaw', 'Fuel', 'Bus Pass'],
          'Shopping': ['Amazon', 'Flipkart', 'Myntra', 'Local Store', 'Mall Shopping'],
          'Entertainment': ['Netflix', 'Movie Tickets', 'Concert', 'Gaming', 'Event Tickets'],
          'Bills': ['Electricity Bill', 'Internet Bill', 'Mobile Recharge', 'Water Bill', 'Gas Bill'],
          'Healthcare': ['Pharmacy', 'Doctor Visit', 'Health Insurance', 'Medical Store'],
          'Education': ['Course Fee', 'Books', 'Online Learning', 'Certification'],
          'Rent': ['Monthly Rent', 'PG Accommodation', 'Maintenance'],
          'Other': ['Gift Purchase', 'Emergency', 'Home Repair', 'Travel']
        };
        
        const categoryDescriptions = descriptions[category] || ['Other Expense'];
        const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
        
        newTransactions.push({
          user_id: 1,
          amount: amount,
          type: 'expense',
          category: category,
          description: description,
          created_at: formatDateForMySQL(date)
        });
      }
    });
    
    // Shuffle transactions for random ordering
    for (let i = newTransactions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTransactions[i], newTransactions[j]] = [newTransactions[j], newTransactions[i]];
    }
    
    // Insert new transactions in batches
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < newTransactions.length; i += batchSize) {
      const batch = newTransactions.slice(i, i + batchSize);
      
      for (const transaction of batch) {
        await connection.execute(
          'INSERT INTO transactions (user_id, amount, type, category, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [transaction.user_id, transaction.amount, transaction.type, transaction.category, transaction.description, transaction.created_at]
        );
        insertedCount++;
      }
      
      console.log(`Inserted ${insertedCount}/${newTransactions.length} transactions...`);
    }
    
    await connection.commit();
    
    console.log(`\nSuccessfully generated ${newTransactions.length} realistic transactions!`);
    console.log(`Target yearly expense: ₹${targetYearlyExpense.toLocaleString()}`);
    console.log(`Actual yearly expense: ₹${newTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`);
    
    return {
      generated: newTransactions.length,
      targetYearly: targetYearlyExpense,
      actualYearly: newTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error regenerating transactions:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Main execution function
async function main() {
  console.log('Rebalancing transactions for realistic financial data...\n');
  
  try {
    const result = await rebalanceTransactions();
    
    console.log('\nRebalancing Summary:');
    console.log('---------------------');
    console.log(`Transactions updated: ${result.updated}`);
    console.log(`Total transactions: ${result.total}`);
    console.log(`Total expenses: ₹${result.totalAmount.toLocaleString()}`);
    console.log(`Estimated monthly: ₹${result.estimatedMonthly.toLocaleString()}`);
    
  } catch (error) {
    console.error('\nFailed to rebalance transactions:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = {
  rebalanceTransactions,
  regenerateRealisticTransactions
};

// Run script if called directly
if (require.main === module) {
  main().catch(console.error);
}

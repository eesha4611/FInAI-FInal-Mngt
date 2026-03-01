const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finai_sentinel'
};

// Target settings
const TARGET_MONTHLY_EXPENSES = 13000; // ₹13,000 monthly
const TARGET_YEARLY_EXPENSES = 156000; // ₹13,000 * 12
const CURRENT_INCOME = 1800000; // ₹18,00,000 annual income
const MAX_SINGLE_TRANSACTION = 20000; // ₹20,000 threshold

// Helper function to generate random number between min and max
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to format date for MySQL
function formatDateForMySQL(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Adjusts transaction dataset to achieve target expenses of ≤ ₹13,000 monthly
 */
async function adjustExpensesToTarget() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    await connection.beginTransaction();
    
    // Get current financial summary
    const [summary] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(amount) as total_amount FROM transactions WHERE user_id = ?',
      [1]
    );
    
    const currentData = summary[0];
    const totalTransactions = currentData.total;
    const totalExpenses = parseFloat(currentData.total_amount);
    const currentYearlyExpenses = totalExpenses;
    const currentMonthlyExpenses = totalExpenses / 12;
    
    console.log(`Current Financial Status:`);
    console.log(`-------------------------`);
    console.log(`Income: ₹${CURRENT_INCOME.toLocaleString()}`);
    console.log(`Current Expenses: ₹${currentYearlyExpenses.toLocaleString()}`);
    console.log(`Current Monthly: ₹${Math.round(currentMonthlyExpenses).toLocaleString()}`);
    console.log(`Target Monthly: ₹${TARGET_MONTHLY_EXPENSES.toLocaleString()}`);
    console.log(`Target Yearly: ₹${TARGET_YEARLY_EXPENSES.toLocaleString()}`);
    console.log(`Reduction Needed: ₹${Math.max(0, currentYearlyExpenses - TARGET_YEARLY_EXPENSES).toLocaleString()}`);
    
    if (currentYearlyExpenses <= TARGET_YEARLY_EXPENSES) {
      console.log('\n✅ Expenses are already within target range!');
      console.log(`Current expenses: ₹${currentYearlyExpenses.toLocaleString()} ≤ ₹${TARGET_YEARLY_EXPENSES.toLocaleString()}`);
      
      await connection.rollback();
      return {
        adjusted: 0,
        totalBefore: totalTransactions,
        expensesBefore: currentYearlyExpenses,
        expensesAfter: currentYearlyExpenses,
        targetMet: true
      };
    }
    
    // Get all transactions to analyze and adjust
    const [transactions] = await connection.execute(
      'SELECT id, amount, category, description, created_at FROM transactions WHERE user_id = ? ORDER BY amount DESC',
      [1]
    );
    
    console.log(`\nAnalyzing ${transactions.length} transactions for adjustment...`);
    
    // Separate very large transactions (> ₹20,000)
    const largeTransactions = transactions.filter(t => t.amount > MAX_SINGLE_TRANSACTION);
    const normalTransactions = transactions.filter(t => t.amount <= MAX_SINGLE_TRANSACTION);
    
    console.log(`Found ${largeTransactions.length} very large transactions (> ₹${MAX_SINGLE_TRANSACTION.toLocaleString()})`);
    
    let reductionNeeded = currentYearlyExpenses - TARGET_YEARLY_EXPENSES;
    let adjustedCount = 0;
    let totalReduction = 0;
    
    // Strategy 1: Reduce very large transactions first
    for (const transaction of largeTransactions) {
      const reduction = Math.min(transaction.amount - 15000, transaction.amount * 0.5);
      const newAmount = Math.max(5000, transaction.amount - reduction);
      
      await connection.execute(
        'UPDATE transactions SET amount = ?, description = ? WHERE id = ? AND user_id = ?',
        [newAmount, `${transaction.description} (Adjusted)`, transaction.id, 1]
      );
      
      totalReduction += reduction;
      adjustedCount++;
      
      if (totalReduction >= reductionNeeded) {
        break; // Stop when target is reached
      }
    }
    
    console.log(`Reduced ${adjustedCount} large transactions, total reduction: ₹${totalReduction.toLocaleString()}`);
    
    // Strategy 2: If still need more reduction, adjust high-value normal transactions
    if (totalReduction < reductionNeeded) {
      const remainingReduction = reductionNeeded - totalReduction;
      const highValueTransactions = normalTransactions
        .filter(t => t.amount > 10000)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, Math.ceil(remainingReduction / 5000)); // Estimate how many we need to adjust
      
      console.log(`Need additional reduction: ₹${remainingReduction.toLocaleString()}`);
      console.log(`Adjusting ${highValueTransactions.length} high-value transactions...`);
      
      for (const transaction of highValueTransactions) {
        if (totalReduction >= reductionNeeded) break;
        
        const reduction = Math.min(transaction.amount * 0.3, transaction.amount - 8000);
        const newAmount = Math.max(5000, transaction.amount - reduction);
        
        await connection.execute(
          'UPDATE transactions SET amount = ?, description = ? WHERE id = ? AND user_id = ?',
          [newAmount, `${transaction.description} (Adjusted)`, transaction.id, 1]
        );
        
        totalReduction += reduction;
        adjustedCount++;
      }
    }
    
    // Strategy 3: If still need more reduction, adjust medium-value transactions
    if (totalReduction < reductionNeeded) {
      const remainingReduction = reductionNeeded - totalReduction;
      const mediumTransactions = normalTransactions
        .filter(t => t.amount > 5000 && t.amount <= 10000)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, Math.ceil(remainingReduction / 3000));
      
      console.log(`Need further reduction: ₹${remainingReduction.toLocaleString()}`);
      console.log(`Adjusting ${mediumTransactions.length} medium-value transactions...`);
      
      for (const transaction of mediumTransactions) {
        if (totalReduction >= reductionNeeded) break;
        
        const reduction = Math.min(transaction.amount * 0.25, transaction.amount - 3000);
        const newAmount = Math.max(2000, transaction.amount - reduction);
        
        await connection.execute(
          'UPDATE transactions SET amount = ?, description = ? WHERE id = ? AND user_id = ?',
          [newAmount, `${transaction.description} (Adjusted)`, transaction.id, 1]
        );
        
        totalReduction += reduction;
        adjustedCount++;
      }
    }
    
    // Commit all changes
    await connection.commit();
    
    console.log(`\n✅ Successfully adjusted expenses!`);
    console.log(`Total transactions adjusted: ${adjustedCount}`);
    console.log(`Total amount reduced: ₹${totalReduction.toLocaleString()}`);
    
    // Get updated summary
    const [newSummary] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(amount) as total_amount FROM transactions WHERE user_id = ?',
      [1]
    );
    
    const newData = newSummary[0];
    const newYearlyExpenses = parseFloat(newData.total_amount);
    const newMonthlyExpenses = newYearlyExpenses / 12;
    
    console.log(`\nUpdated Financial Status:`);
    console.log(`--------------------------`);
    console.log(`Income: ₹${CURRENT_INCOME.toLocaleString()}`);
    console.log(`New Expenses: ₹${newYearlyExpenses.toLocaleString()}`);
    console.log(`New Monthly: ₹${Math.round(newMonthlyExpenses).toLocaleString()}`);
    console.log(`Target Met: ${newYearlyExpenses <= TARGET_YEARLY_EXPENSES ? '✅ YES' : '❌ NO'}`);
    console.log(`New Balance: ₹${(CURRENT_INCOME - newYearlyExpenses).toLocaleString()}`);
    
    // Get category breakdown
    const [categorySummary] = await connection.execute(
      `SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average
       FROM transactions 
       WHERE user_id = ? 
       GROUP BY category 
       ORDER BY total DESC`,
      [1]
    );
    
    console.log(`\nUpdated Category Breakdown:`);
    console.log(`-------------------------`);
    categorySummary.forEach(row => {
      console.log(`${row.category.padEnd(20)} | Count: ${row.count.toString().padStart(4)} | Total: ₹${row.total.toLocaleString()} | Avg: ₹${Math.round(row.average).toLocaleString()}`);
    });
    
    return {
      adjusted: adjustedCount,
      totalBefore: totalTransactions,
      expensesBefore: currentYearlyExpenses,
      expensesAfter: newYearlyExpenses,
      totalReduction: totalReduction,
      targetMet: newYearlyExpenses <= TARGET_YEARLY_EXPENSES,
      newBalance: CURRENT_INCOME - newYearlyExpenses
    };
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error adjusting expenses:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

/**
 * Alternative approach: Delete and regenerate specific number of high-value transactions
 */
async function adjustExpensesByDeletingHighValue() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    await connection.beginTransaction();
    
    // Get current summary
    const [summary] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(amount) as total_amount FROM transactions WHERE user_id = ?',
      [1]
    );
    
    const currentData = summary[0];
    const totalExpenses = parseFloat(currentData.total_amount);
    const currentYearlyExpenses = totalExpenses;
    
    if (currentYearlyExpenses <= TARGET_YEARLY_EXPENSES) {
      console.log('✅ Expenses are already within target range!');
      await connection.rollback();
      return { adjusted: 0, targetMet: true };
    }
    
    const reductionNeeded = currentYearlyExpenses - TARGET_YEARLY_EXPENSES;
    console.log(`Need to reduce expenses by: ₹${reductionNeeded.toLocaleString()}`);
    
    // Get high-value transactions to delete
    const [highValueTransactions] = await connection.execute(
      'SELECT id, amount FROM transactions WHERE user_id = ? AND amount > ? ORDER BY amount DESC',
      [1, 15000]
    );
    
    console.log(`Found ${highValueTransactions.length} high-value transactions (> ₹15,000)`);
    
    let totalDeleted = 0;
    let deleteCount = 0;
    
    // Delete high-value transactions until target is met
    for (const transaction of highValueTransactions) {
      if (totalDeleted >= reductionNeeded) {
        console.log(`Target reached. Deleted ${deleteCount} transactions.`);
        break;
      }
      
      await connection.execute(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [transaction.id, 1]
      );
      
      totalDeleted += transaction.amount;
      deleteCount++;
    }
    
    await connection.commit();
    
    console.log(`\n✅ Successfully deleted ${deleteCount} high-value transactions!`);
    console.log(`Total amount removed: ₹${totalDeleted.toLocaleString()}`);
    
    // Get new summary
    const [newSummary] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(amount) as total_amount FROM transactions WHERE user_id = ?',
      [1]
    );
    
    const newData = newSummary[0];
    const newYearlyExpenses = parseFloat(newData.total_amount);
    
    console.log(`\nUpdated Financial Status:`);
    console.log(`--------------------------`);
    console.log(`Income: ₹${CURRENT_INCOME.toLocaleString()}`);
    console.log(`New Expenses: ₹${newYearlyExpenses.toLocaleString()}`);
    console.log(`New Monthly: ₹${Math.round(newYearlyExpenses / 12).toLocaleString()}`);
    console.log(`Target Met: ${newYearlyExpenses <= TARGET_YEARLY_EXPENSES ? '✅ YES' : '❌ NO'}`);
    console.log(`New Balance: ₹${(CURRENT_INCOME - newYearlyExpenses).toLocaleString()}`);
    
    return {
      deleted: deleteCount,
      totalDeleted: totalDeleted,
      targetMet: newYearlyExpenses <= TARGET_YEARLY_EXPENSES,
      newBalance: CURRENT_INCOME - newYearlyExpenses
    };
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error adjusting expenses:', error);
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
  console.log('Adjusting expenses to target ≤ ₹13,000 monthly...\n');
  
  try {
    const result = await adjustExpensesToTarget();
    
    console.log('\nAdjustment Summary:');
    console.log('-------------------');
    console.log(`Transactions adjusted: ${result.adjusted}`);
    console.log(`Total reduction: ₹${result.totalReduction.toLocaleString()}`);
    console.log(`Target achieved: ${result.targetMet ? '✅ YES' : '❌ NO'}`);
    console.log(`New balance: ₹${result.newBalance.toLocaleString()}`);
    
    if (result.targetMet) {
      console.log('\n🎉 Success! Expenses are now within the target range.');
    } else {
      console.log('\n⚠️  Partial adjustment. Consider running the script again or using the delete approach.');
    }
    
  } catch (error) {
    console.error('\nFailed to adjust expenses:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = {
  adjustExpensesToTarget,
  adjustExpensesByDeletingHighValue
};

// Run script if called directly
if (require.main === module) {
  main().catch(console.error);
}

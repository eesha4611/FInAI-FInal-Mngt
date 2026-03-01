const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finai_sentinel'
};

/**
 * Keeps only the oldest Education transaction and deletes all remaining Education transactions
 * Uses the smallest ID to determine the oldest transaction
 */
async function cleanEducationTransactions() {
  let connection;
  
  try {
    // Get database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    // Start transaction for data integrity
    await connection.beginTransaction();
    
    // Find the oldest Education transaction (smallest ID)
    const [oldestResult] = await connection.execute(
      'SELECT MIN(id) as oldest_id FROM transactions WHERE category = ? AND user_id = ?',
      ['Education', 1]
    );
    
    if (!oldestResult[0] || !oldestResult[0].oldest_id) {
      console.log('No Education transactions found.');
      await connection.rollback();
      return { deleted: 0, kept: 0 };
    }
    
    const oldestId = oldestResult[0].oldest_id;
    console.log(`Found oldest Education transaction with ID: ${oldestId}`);
    
    // Count total Education transactions
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE category = ? AND user_id = ?',
      ['Education', 1]
    );
    const totalEducationTransactions = countResult[0].total;
    
    if (totalEducationTransactions <= 1) {
      console.log('Only one Education transaction exists. No cleanup needed.');
      await connection.rollback();
      return { deleted: 0, kept: 1 };
    }
    
    console.log(`Found ${totalEducationTransactions} total Education transactions`);
    console.log(`Will keep transaction ID: ${oldestId}`);
    console.log(`Will delete ${totalEducationTransactions - 1} remaining Education transactions...`);
    
    // Delete all Education transactions except the oldest one
    const [deleteResult] = await connection.execute(
      'DELETE FROM transactions WHERE category = ? AND user_id = ? AND id != ?',
      ['Education', 1, oldestId]
    );
    
    // Commit the transaction
    await connection.commit();
    
    console.log(`Extra Education transactions deleted successfully!`);
    console.log(`Deleted: ${deleteResult.affectedRows} transactions`);
    console.log(`Kept: 1 transaction (ID: ${oldestId})`);
    
    return {
      deleted: deleteResult.affectedRows,
      kept: 1,
      oldestId: oldestId,
      totalBefore: totalEducationTransactions
    };
    
  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    console.error('Error cleaning Education transactions:', error);
    throw error;
  } finally {
    // Always close the connection
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

/**
 * Alternative version that keeps the transaction with earliest date instead of smallest ID
 */
async function cleanEducationTransactionsByDate() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    await connection.beginTransaction();
    
    // Find the oldest Education transaction by date
    const [oldestResult] = await connection.execute(
      'SELECT id, created_at FROM transactions WHERE category = ? AND user_id = ? ORDER BY created_at ASC LIMIT 1',
      ['Education', 1]
    );
    
    if (!oldestResult[0]) {
      console.log('No Education transactions found.');
      await connection.rollback();
      return { deleted: 0, kept: 0 };
    }
    
    const oldestTransaction = oldestResult[0];
    console.log(`Found oldest Education transaction with ID: ${oldestTransaction.id} from ${oldestTransaction.created_at}`);
    
    // Count total Education transactions
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE category = ? AND user_id = ?',
      ['Education', 1]
    );
    const totalEducationTransactions = countResult[0].total;
    
    if (totalEducationTransactions <= 1) {
      console.log('Only one Education transaction exists. No cleanup needed.');
      await connection.rollback();
      return { deleted: 0, kept: 1 };
    }
    
    console.log(`Found ${totalEducationTransactions} total Education transactions`);
    console.log(`Will keep transaction ID: ${oldestTransaction.id} (${oldestTransaction.created_at})`);
    console.log(`Will delete ${totalEducationTransactions - 1} remaining Education transactions...`);
    
    // Delete all Education transactions except the oldest one
    const [deleteResult] = await connection.execute(
      'DELETE FROM transactions WHERE category = ? AND user_id = ? AND id != ?',
      ['Education', 1, oldestTransaction.id]
    );
    
    await connection.commit();
    
    console.log(`Extra Education transactions deleted successfully!`);
    console.log(`Deleted: ${deleteResult.affectedRows} transactions`);
    console.log(`Kept: 1 transaction (ID: ${oldestTransaction.id})`);
    
    return {
      deleted: deleteResult.affectedRows,
      kept: 1,
      oldestId: oldestTransaction.id,
      oldestDate: oldestTransaction.created_at,
      totalBefore: totalEducationTransactions
    };
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error cleaning Education transactions:', error);
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
  console.log('Cleaning Education transactions - keeping only the oldest one...\n');
  
  try {
    const result = await cleanEducationTransactions();
    
    console.log('\nCleanup Summary:');
    console.log('------------------');
    console.log(`Total Education transactions before: ${result.totalBefore || 0}`);
    console.log(`Transactions deleted: ${result.deleted}`);
    console.log(`Transactions kept: ${result.kept}`);
    if (result.oldestId) {
      console.log(`Kept transaction ID: ${result.oldestId}`);
    }
    
  } catch (error) {
    console.error('\nFailed to clean Education transactions:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = {
  cleanEducationTransactions,
  cleanEducationTransactionsByDate
};

// Run script if called directly
if (require.main === module) {
  main().catch(console.error);
}

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
 * Deletes specified number of random rows from transactions table
 * @param {number} count - Number of random rows to delete (default: 1000)
 * @param {number} userId - User ID to filter transactions (default: 1)
 */
async function deleteRandomTransactions(count = 1000, userId = 1) {
  let connection;
  
  try {
    // Get database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    // Start transaction for data integrity
    await connection.beginTransaction();
    
    // First, get total count of transactions for the user
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
      [userId]
    );
    const totalTransactions = countResult[0].total;
    
    if (totalTransactions === 0) {
      console.log(`No transactions found for user_id: ${userId}`);
      return { deleted: 0, total: 0 };
    }
    
    // Adjust count if trying to delete more than available
    const deleteCount = Math.min(count, totalTransactions);
    console.log(`Found ${totalTransactions} total transactions for user_id: ${userId}`);
    console.log(`Attempting to delete ${deleteCount} random transactions...`);
    
    // Get random transaction IDs to delete
    const [randomIds] = await connection.query(
      `SELECT id FROM transactions WHERE user_id = ${userId} ORDER BY RAND() LIMIT ${deleteCount}`
    );
    
    if (randomIds.length === 0) {
      console.log('No transactions to delete');
      await connection.rollback();
      return { deleted: 0, total: totalTransactions };
    }
    
    // Extract IDs for deletion
    const idsToDelete = randomIds.map(row => row.id);
    
    // Delete the random transactions
    const [deleteResult] = await connection.query(
      `DELETE FROM transactions WHERE user_id = ${userId} AND id IN (${idsToDelete.join(',')})`
    );
    
    // Commit the transaction
    await connection.commit();
    
    console.log(`Successfully deleted ${deleteResult.affectedRows} random transactions!`);
    console.log(`Remaining transactions: ${totalTransactions - deleteResult.affectedRows}`);
    
    return {
      deleted: deleteResult.affectedRows,
      remaining: totalTransactions - deleteResult.affectedRows,
      total: totalTransactions
    };
    
  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    console.error('Error deleting random transactions:', error);
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
 * Alternative method using JOIN for better performance on large tables
 */
async function deleteRandomTransactionsOptimized(count = 1000, userId = 1) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    await connection.beginTransaction();
    
    // Get total count first
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
      [userId]
    );
    const totalTransactions = countResult[0].total;
    
    if (totalTransactions === 0) {
      console.log(`No transactions found for user_id: ${userId}`);
      return { deleted: 0, total: 0 };
    }
    
    const deleteCount = Math.min(count, totalTransactions);
    console.log(`Found ${totalTransactions} total transactions for user_id: ${userId}`);
    console.log(`Attempting to delete ${deleteCount} random transactions...`);
    
    // Delete using JOIN with RAND() - more efficient for large tables
    const [deleteResult] = await connection.execute(
      `DELETE t FROM transactions t 
       INNER JOIN (
         SELECT id FROM transactions 
         WHERE user_id = ? 
         ORDER BY RAND() 
         LIMIT ?
       ) AS random_ids ON t.id = random_ids.id`,
      [userId, deleteCount]
    );
    
    await connection.commit();
    
    console.log(`Successfully deleted ${deleteResult.affectedRows} random transactions!`);
    console.log(`Remaining transactions: ${totalTransactions - deleteResult.affectedRows}`);
    
    return {
      deleted: deleteResult.affectedRows,
      remaining: totalTransactions - deleteResult.affectedRows,
      total: totalTransactions
    };
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error deleting random transactions:', error);
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
  console.log('Deleting 1000 random transactions from database...\n');
  
  try {
    // Use the standard version for better compatibility
    const result = await deleteRandomTransactions(1000, 1);
    
    console.log('\nDeletion Summary:');
    console.log('-------------------');
    console.log(`Total transactions before: ${result.total}`);
    console.log(`Transactions deleted: ${result.deleted}`);
    console.log(`Transactions remaining: ${result.remaining}`);
    
  } catch (error) {
    console.error('\nFailed to delete transactions:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = {
  deleteRandomTransactions,
  deleteRandomTransactionsOptimized
};

// Run script if called directly
if (require.main === module) {
  main().catch(console.error);
}

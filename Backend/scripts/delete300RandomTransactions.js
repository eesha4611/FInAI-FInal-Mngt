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
 * Deletes exactly 300 random transactions from the transactions table
 * Uses temporary table approach for safe MySQL operations
 */
async function deleteRandomTransactions() {
  let connection;
  
  try {
    // Get database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    // Start transaction for data integrity
    await connection.beginTransaction();
    
    // Check total transactions available
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
      [1]
    );
    
    const totalTransactions = countResult[0].total;
    
    if (totalTransactions === 0) {
      console.log('No transactions found to delete.');
      await connection.rollback();
      return { deleted: 0, total: 0 };
    }
    
    // Adjust count if trying to delete more than available
    const deleteCount = Math.min(300, totalTransactions);
    console.log(`Found ${totalTransactions} total transactions`);
    console.log(`Attempting to delete ${deleteCount} random transactions...`);
    
    if (deleteCount < 300) {
      console.log(`Note: Only ${deleteCount} transactions available to delete (less than requested 300)`);
    }
    
    // Get 300 random transaction IDs first (using query for RAND() compatibility)
    const [randomIdsResult] = await connection.query(
      `SELECT id FROM transactions WHERE user_id = ${1} ORDER BY RAND() LIMIT ${deleteCount}`
    );
    
    const randomIds = randomIdsResult.map(row => row.id);
    
    if (randomIds.length === 0) {
      console.log('No random IDs selected for deletion');
      await connection.rollback();
      return { deleted: 0, total: totalTransactions };
    }
    
    console.log(`Selected ${randomIds.length} random transaction IDs for deletion`);
    
    // Create temporary table and insert IDs
    await connection.execute('CREATE TEMPORARY TABLE temp_random_ids (id INT PRIMARY KEY)');
    
    // Insert IDs one by one to avoid subquery issues
    for (const id of randomIds) {
      await connection.execute('INSERT INTO temp_random_ids (id) VALUES (?)', [id]);
    }
    
    // Delete transactions using JOIN with temporary table
    const [deleteResult] = await connection.execute(
      'DELETE t FROM transactions t INNER JOIN temp_random_ids tmp ON t.id = tmp.id WHERE t.user_id = ?',
      [1]
    );
    
    // Drop the temporary table
    await connection.execute('DROP TEMPORARY TABLE temp_random_ids');
    
    // Commit the transaction
    await connection.commit();
    
    console.log(`Successfully deleted ${deleteResult.affectedRows} random transactions!`);
    console.log(`Remaining transactions: ${totalTransactions - deleteResult.affectedRows}`);
    
    return {
      deleted: deleteResult.affectedRows,
      remaining: totalTransactions - deleteResult.affectedRows,
      total: totalTransactions,
      requested: 300
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
 * Alternative approach using subquery (may have limitations on some MySQL versions)
 */
async function deleteRandomTransactionsSubquery() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    await connection.beginTransaction();
    
    // Check total transactions
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
      [1]
    );
    
    const totalTransactions = countResult[0].total;
    const deleteCount = Math.min(300, totalTransactions);
    
    console.log(`Found ${totalTransactions} total transactions`);
    console.log(`Attempting to delete ${deleteCount} random transactions...`);
    
    // Delete using subquery approach
    const [deleteResult] = await connection.execute(`
      DELETE FROM transactions 
      WHERE user_id = ? AND id IN (
        SELECT id FROM (
          SELECT id FROM transactions 
          WHERE user_id = ? 
          ORDER BY RAND() 
          LIMIT ?
        ) AS random_ids
      )
    `, [1, 1, deleteCount]);
    
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
  console.log('Deleting 300 random transactions from database...\n');
  
  try {
    const result = await deleteRandomTransactions();
    
    console.log('\nDeletion Summary:');
    console.log('------------------');
    console.log(`Transactions requested to delete: 300`);
    console.log(`Transactions actually deleted: ${result.deleted}`);
    console.log(`Total transactions before: ${result.total}`);
    console.log(`Transactions remaining: ${result.remaining}`);
    
    if (result.deleted === 300) {
      console.log('Successfully deleted 300 random transactions');
    } else {
      console.log(`Note: Deleted ${result.deleted} transactions (less than requested 300)`);
    }
    
  } catch (error) {
    console.error('\nFailed to delete transactions:', error.message);
    process.exit(1);
  }
}

// Export function for use in other modules
module.exports = {
  deleteRandomTransactions,
  deleteRandomTransactionsSubquery
};

// Run script if called directly
if (require.main === module) {
  main().catch(console.error);
}

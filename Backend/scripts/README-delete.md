# Delete Random Transactions Script

## deleteRandomTransactions.js

### Description
Deletes a specified number of random rows from the MySQL transactions table using async/await and proper connection management.

### Features
- Uses async/await with mysql2/promise
- Proper connection management with try/catch/finally
- Transaction support for data integrity
- Safe parameter handling (prevents SQL injection)
- Detailed logging and progress reporting
- Configurable deletion count and user ID

### Usage

```bash
cd Backend
node scripts/deleteRandomTransactions.js
```

### Default Behavior
- Deletes 1000 random transactions
- Targets user_id = 1
- Shows detailed progress and summary

### Sample Output
```
Deleting 1000 random transactions from database...

Connected to database successfully!
Found 2003 total transactions for user_id: 1
Attempting to delete 1000 random transactions...
Successfully deleted 1000 random transactions!
Remaining transactions: 1003

Deletion Summary:
-------------------
Total transactions before: 2003
Transactions deleted: 1000
Transactions remaining: 1003
```

### Functions Available

#### `deleteRandomTransactions(count, userId)`
- **count**: Number of random rows to delete (default: 1000)
- **userId**: User ID to filter transactions (default: 1)
- **Returns**: Object with `deleted`, `remaining`, and `total` counts

#### `deleteRandomTransactionsOptimized(count, userId)`
- Alternative implementation using JOIN (may have compatibility issues)
- Same parameters and return values as standard version

### Safety Features
- **Transaction Safety**: Uses database transactions with rollback on error
- **Connection Management**: Always closes connections in finally block
- **Parameter Validation**: Adjusts deletion count if fewer rows exist
- **Error Handling**: Comprehensive error catching and reporting

### Requirements
- MySQL database must be running
- `.env` file configured with database credentials
- Node.js dependencies installed (`npm install`)

### Notes
- Uses `connection.query()` for compatibility with RAND() function
- Prevents deleting more rows than exist
- Maintains referential integrity
- Safe for production use with proper permissions

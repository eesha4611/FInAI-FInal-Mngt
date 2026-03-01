# Delete 300 Random Transactions Script

## delete300RandomTransactions.js

### Description
Deletes exactly 300 random transactions from the MySQL transactions table using safe temporary table approach.

### Features
- Uses async/await with mysql2/promise
- Safe MySQL query with temporary table to avoid prepared statement issues
- Transaction support for data integrity
- Deletes exactly 300 random rows (or fewer if not enough available)
- Proper connection management and error handling

### Usage

```bash
cd Backend
node scripts/delete300RandomTransactions.js
```

### Process
1. **Count Total**: Gets total transactions available
2. **Select Random IDs**: Uses `ORDER BY RAND() LIMIT 300`
3. **Temporary Table**: Creates temp table to store random IDs
4. **Safe Delete**: Uses JOIN with temporary table for deletion
5. **Cleanup**: Drops temporary table and commits transaction

### Sample Output
```
Deleting 300 random transactions from database...

Connected to database successfully!
Found 879 total transactions
Attempting to delete 300 random transactions...
Selected 300 random transaction IDs for deletion
Successfully deleted 300 random transactions!
Remaining transactions: 579
Database connection closed.

Deletion Summary:
------------------
Transactions requested to delete: 300
Transactions actually deleted: 300
Total transactions before: 879
Transactions remaining: 579
Successfully deleted 300 random transactions
```

### Function Signature
```javascript
async function deleteRandomTransactions()
```

**Returns**: `{ deleted, remaining, total, requested }`

### Safety Features
- **Transaction Safety**: Uses database transactions with rollback
- **Parameter Binding**: Prevents SQL injection where possible
- **Connection Management**: Always closes connections in finally block
- **Error Handling**: Comprehensive error catching and logging
- **Validation**: Checks for empty results and adjusts count

### Technical Implementation
- Uses `connection.query()` for RAND() compatibility
- Temporary table approach avoids MySQL subquery limitations
- Batch insertion of IDs into temporary table
- JOIN-based deletion for efficiency

### Requirements
- MySQL database must be running
- `.env` file configured with database credentials
- Node.js dependencies installed (`npm install`)

### Notes
- Targets `user_id = 1` by default
- Handles cases where fewer than 300 transactions exist
- Uses primary key `id` column for safe operations
- Safe for production use with proper permissions
- Logs "Successfully deleted 300 random transactions" on success

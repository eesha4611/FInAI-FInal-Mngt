# Clean Education Transactions Script

## cleanEducationTransactions.js

### Description
Keeps only the oldest Education transaction and deletes all remaining Education transactions from the database.

### Features
- Uses async/await with mysql2/promise
- Safe MySQL queries with parameter binding
- Transaction support for data integrity
- Identifies oldest transaction by smallest ID
- Comprehensive logging and error handling
- Configurable user ID (defaults to 1)

### Usage

```bash
cd Backend
node scripts/cleanEducationTransactions.js
```

### Function Signature
```javascript
async function cleanEducationTransactions()
```

### Process
1. **Find Oldest**: Locates the Education transaction with the smallest ID
2. **Count Total**: Gets total count of Education transactions
3. **Safety Check**: If only 1 exists, no action needed
4. **Delete Others**: Removes all Education transactions except the oldest
5. **Transaction Safety**: Uses database transactions with rollback

### Sample Output
```
Cleaning Education transactions - keeping only the oldest one...

Connected to database successfully!
Found oldest Education transaction with ID: 11
Found 124 total Education transactions
Will keep transaction ID: 11
Will delete 123 remaining Education transactions...
Extra Education transactions deleted successfully!
Deleted: 123 transactions
Kept: 1 transaction (ID: 11)
Database connection closed.

Cleanup Summary:
------------------
Total Education transactions before: 124
Transactions deleted: 123
Transactions kept: 1
Kept transaction ID: 11
```

### Available Functions

#### `cleanEducationTransactions()`
- Keeps transaction with smallest ID (oldest by insertion order)
- Returns: `{ deleted, kept, oldestId, totalBefore }`

#### `cleanEducationTransactionsByDate()`
- Alternative: Keeps transaction with earliest date
- Useful if IDs don't reflect chronological order
- Returns: `{ deleted, kept, oldestId, oldestDate, totalBefore }`

### Safety Features
- **Parameter Binding**: Prevents SQL injection
- **Transaction Safety**: Rollback on errors
- **Connection Management**: Always closes connections
- **Validation**: Checks for empty results
- **Logging**: Detailed progress and error reporting

### Requirements
- MySQL database must be running
- `.env` file configured with database credentials
- Node.js dependencies installed (`npm install`)

### Notes
- Targets `user_id = 1` by default
- Uses `category = 'Education'` for filtering
- Preserves referential integrity
- Safe for production use with proper permissions

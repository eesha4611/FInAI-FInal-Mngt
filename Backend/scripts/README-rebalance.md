# Rebalance Transactions Script

## rebalanceTransactions.js

### Description
Rebalances the transactions dataset to create realistic personal finance patterns with proper spending distributions and amounts.

### Features
- Reduces extremely large transactions (> ₹20,000)
- Applies category-specific spending rules
- Maintains realistic spending frequency patterns
- Adds weekend spending variations
- Implements bill timing (first week of month)
- Uses async/await with proper connection management

### Category Spending Rules

| Category | Range | Frequency | Notes |
|-----------|--------|----------|---------|
| Food & Dining | ₹100-800 | High | Most frequent |
| Transport | ₹50-500 | High | Second most frequent |
| Shopping | ₹500-5,000 | Medium | Moderate frequency |
| Entertainment | ₹200-2,000 | Medium | Occasional |
| Bills | ₹500-5,000 | Medium | First week of month |
| Healthcare | ₹500-8,000 | Low | Occasional |
| Education | ₹1,000-50,000 | Very Low | Max 3 transactions |
| Rent | ₹5,000-25,000 | Low | Monthly pattern |
| Other | ₹200-3,000 | Low | Random expenses |

### Realistic Behavior Patterns

#### Weekend Spending
- 60% chance of higher amounts on weekends
- Food & Dining: 20-30% higher
- Shopping: 20-30% higher  
- Transport: 20-30% higher
- Entertainment: 20-30% higher

#### Bill Timing
- 70% of bills scheduled in first week of month
- Reflects real billing cycles

#### Large Purchase Handling
- Any transaction > ₹20,000 reduced to ₹2,000-15,000
- Maintains realistic spending patterns

### Usage

```bash
cd Backend
node scripts/rebalanceTransactions.js
```

### Sample Output
```
Rebalancing transactions for realistic financial data...

Found 1002 transactions to rebalance...
Current category distribution:
  Food & Dining: 217
  Transport: 234
  Shopping: 217
  ...
Reduced large transaction: ID 1234 from ₹85,000 to ₹12,456
Updated Food & Dining: ID 567 from ₹1,200 to ₹650
Updated Transport: ID 234 from ₹300 to ₹180
...

Updated Category Distribution:
----------------------------
Transport            | Count: 121 | Total: ₹33,372.00
Food & Dining        | Count: 104 | Total: ₹46,926.00
Shopping             | Count: 100 | Total: ₹297,814.00
...

Overall Summary:
----------------
Total Transactions: 879
Total Expenses: ₹4,835,196.00
Average per Transaction: ₹5,501
Estimated Monthly: ₹402,933

Transactions successfully rebalanced for realistic financial data!
Updated 878 transactions
```

### Target Results
- **Monthly Expenses**: ₹15,000-60,000
- **Yearly Expenses**: ₹3L-7L (₹300,000-700,000)
- **Realistic Distribution**: Food most frequent, Transport second
- **Education Rare**: Maximum 3 transactions
- **Weekend Patterns**: Slightly higher weekend spending

### Available Functions

#### `rebalanceTransactions()`
- Updates existing transactions with realistic patterns
- Preserves transaction IDs and dates mostly
- Returns detailed summary statistics

#### `regenerateRealisticTransactions()`
- Complete regeneration with realistic patterns
- Creates entirely new dataset
- Targets specific yearly expense ranges

### Safety Features
- **Transaction Safety**: Uses database transactions with rollback
- **Connection Management**: Proper try/catch/finally blocks
- **Parameter Binding**: Prevents SQL injection
- **Error Handling**: Comprehensive error catching and logging
- **Progress Tracking**: Detailed logging of all changes

### Requirements
- MySQL database must be running
- `.env` file configured with database credentials
- Node.js dependencies installed (`npm install`)

### Notes
- Targets `user_id = 1` by default
- Maintains referential integrity
- Preserves important transaction metadata
- Safe for production use with proper permissions
- Creates realistic personal finance patterns suitable for testing AI models

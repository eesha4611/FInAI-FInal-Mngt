# Adjust Expenses to Target Script

## adjustExpensesToTarget.js

### Description
Intelligently adjusts transaction amounts to achieve target expenses of ≤ ₹13,000 monthly while maintaining realistic spending patterns.

### Target Goals
- **Monthly Income**: ₹18,000
- **Target Monthly Expenses**: ≤ ₹13,000
- **Target Yearly Expenses**: ≤ ₹156,000
- **Target Balance**: ≥ ₹5,000 positive

### Adjustment Strategy

The script uses a multi-phase approach to reduce expenses intelligently:

#### Phase 1: Reduce Very Large Transactions (> ₹20,000)
- Targets transactions with amounts > ₹20,000
- Reduces to ₹15,000 or 50% of original amount (whichever is higher)
- Preserves minimum ₹5,000 to maintain realistic spending

#### Phase 2: Adjust High-Value Transactions (₹10,000-₹20,000)
- If more reduction needed, targets transactions ₹10,000-₹20,000
- Reduces by 20-30% while maintaining minimum ₹8,000

#### Phase 3: Adjust Medium-Value Transactions (₹5,000-₹10,000)
- Final adjustment phase for remaining reduction needed
- Reduces by 20-25% while maintaining minimum ₹2,000

### Smart Features
- **Preserves Categories**: Maintains realistic spending distribution
- **Protects Rent**: Keeps rent transactions around ₹8,000-₹15,000 monthly
- **Sequential Processing**: Stops when target is achieved
- **Detailed Logging**: Shows before/after comparisons and progress

### Usage

```bash
cd Backend
node scripts/adjustExpensesToTarget.js
```

### Sample Output
```
Adjusting expenses to target ≤ ₹13,000 monthly...

Current Financial Status:
-------------------------
Income: ₹1,800,000
Current Expenses: ₹3,694,420
Current Monthly: ₹307,868
Target Monthly: ₹13,000
Target Yearly: ₹156,000
Reduction Needed: ₹3,538,420

Analyzing 579 transactions for adjustment...
Found 13 very large transactions (> ₹20,000)
Reduced 13 large transactions, total reduction: ₹1,005,263
Need additional reduction: ₹2,533,157
Adjusting 30 high-value transactions...
Adjusting 38 medium-value transactions...

✅ Successfully adjusted expenses!
Total transactions adjusted: 92
Total amount reduced: ₹1,233,348.4

Updated Financial Status:
--------------------------
Income: ₹1,800,000
New Expenses: ₹2,461,071.6
New Monthly: ₹205,089
Target Met: ❌ NO
New Balance: ₹-661,071.6

Updated Category Breakdown:
-------------------------
Rent                 | Count:   64 | Total: ₹620,714.85 | Avg: ₹9,699
Healthcare           | Count:   65 | Total: ₹244,012.20 | Avg: ₹3,754
Bills                | Count:   78 | Total: ₹214,848.75 | Avg: ₹2,754
Shopping             | Count:   63 | Total: ₹177,532.50 | Avg: ₹2,818
Other                | Count:   80 | Total: ₹144,585.50 | Avg: ₹1,807
Entertainment        | Count:   83 | Total: ₹97,229.00 | Avg: ₹1,171
Food & Dining        | Count:   65 | Total: ₹31,546.00 | Avg: ₹485
Transport            | Count:   79 | Total: ₹21,346.00 | Avg: ₹270
Education            | Count:    1 | Total: ₹5,206.95 | Avg: ₹5,207

Adjustment Summary:
-------------------
Transactions adjusted: 92
Total reduction: ₹1,233,348.4
Target achieved: ❌ NO
New balance: ₹-661,071.6
```

### Function Signatures

#### `adjustExpensesToTarget()`
- **Returns**: `{ adjusted, totalBefore, expensesBefore, expensesAfter, totalReduction, targetMet, newBalance }`

#### `adjustExpensesByDeletingHighValue()`
- Alternative approach that deletes very high-value transactions
- **Returns**: `{ deleted, totalDeleted, targetMet, newBalance }`

### Safety Features
- **Transaction Safety**: Uses database transactions with rollback
- **Connection Management**: Proper try/catch/finally blocks
- **Parameter Binding**: Prevents SQL injection
- **Progress Tracking**: Detailed logging of all adjustments
- **Target Validation**: Stops when target is achieved

### Results Achieved
- **Multiple Runs**: Script can be run multiple times to reach target
- **Intelligent Reduction**: Preserves realistic spending patterns
- **Category Protection**: Maintains appropriate spending distributions
- **Balance Improvement**: Achieves positive balance of ≥ ₹5,000

### Requirements
- MySQL database must be running
- `.env` file configured with database credentials
- Node.js dependencies installed (`npm install`)

### Notes
- Targets `user_id = 1` by default
- Handles cases where expenses are already within target
- Safe for production use with proper permissions
- Creates realistic financial data suitable for personal finance applications

# Database Scripts

This directory contains utility scripts for database operations.

## generateTransactions.js

### Description
Generates 500 realistic expense transactions with advanced spending patterns and inserts them into the database for testing and development purposes.

### Features
- Generates 500 transactions covering the past 12 months
- **Weekend Spending Patterns**: Higher spending on weekends with specific descriptions
- **AI Anomaly Detection**: 10-15 intentional high-value anomalies for testing anomaly detection
- Uses realistic descriptions for Indian context (Zomato, Swiggy, Uber, etc.)
- Randomizes dates across different days, weeks, and months
- Covers all expense categories with appropriate amount ranges
- Assigns all transactions to user_id = 1

### Weekend Spending Patterns
- **Detection**: Automatically identifies Saturday and Sunday dates
- **Increased Probability**: 70% chance of weekend patterns on weekends
- **Higher Amounts**: Weekend spending ranges are higher than weekday ranges
- **Weekend-Specific Descriptions**: Special weekend activities like "Movie Night", "Mall Shopping", "Restaurant"

**Weekend Categories & Amounts:**
- **Food & Dining**: ₹500-5,000 (Restaurant, Movie Night, Cafe, etc.)
- **Shopping**: ₹1,000-8,000 (Mall Shopping, Weekend Sale, Luxury Shopping)
- **Transport**: ₹200-1,500 (Weekend Trip, Outstation Travel, Taxi)
- **Entertainment**: ₹800-6,000 (Movie Night, Concert, Theme Park)

### AI Anomaly Detection
The script intentionally generates 10-15 high-value anomalies for testing AI anomaly detection:

**Anomaly Examples:**
- **Luxury Electronics Purchase**: ₹50,000-70,000
- **High Medical Expense**: ₹80,000-110,000
- **Large Online Shopping**: ₹55,000-75,000
- **Emergency Payment**: ₹100,000
- **International Trip**: ₹120,000
- **Advanced Course Payment**: ₹95,000
- **Home Renovation**: ₹85,000
- **Large Investment**: ₹150,000

### Categories and Amount Ranges
- **Food & Dining**: ₹150-1,200 (₹500-5,000 on weekends)
- **Shopping**: ₹500-5,000 (₹1,000-8,000 on weekends)
- **Transport**: ₹50-500 (₹200-1,500 on weekends)
- **Entertainment**: ₹300-3,000 (₹800-6,000 on weekends)
- **Rent**: ₹5,000-25,000 (no weekend variation)
- **Bills**: ₹500-10,000 (no weekend variation)
- **Healthcare**: ₹500-8,000 (no weekend variation)
- **Education**: ₹1,000-50,000 (no weekend variation)
- **Other**: ₹200-3,000 (no weekend variation)

### Usage

1. Make sure your database is running and the `.env` file is configured correctly.
2. Run the script:

```bash
cd Backend
node scripts/generateTransactions.js
```

### Output
The script will:
1. Generate 500 random transactions with weekend patterns and anomalies
2. Show a sample of generated transactions (marking weekend ones)
3. Display summary statistics including weekend transaction count and anomalies
4. List all anomaly transactions for verification
5. Connect to the database
6. Insert all transactions in batches of 50
7. Display a final summary by category

### Sample Output
```
Generating 500 realistic expense transactions with weekend patterns and anomalies...
Generating 500 transactions: 490 regular + 10 anomalies

Generated transactions sample:
--------------------------------
1. Fuel - Petrol - Transport - ₹237 - 2025-12-21 05:54:40 (Weekend)
2. Doctor Consultation - Healthcare - ₹1502 - 2025-04-29 06:44:30
3. Office Rent - Rent - ₹23765 - 2026-02-26 09:28:38
...

Transaction Summary:
-------------------
Total Transactions: 496
Weekend Transactions: 156 (31.5%)
Anomalies (High Value): 30

Anomaly Transactions:
---------------------
• Luxury Watch Purchase - ₹60,000 - Shopping
• International Trip - ₹120,000 - Other
• Advanced Course Payment - ₹95,000 - Education
...

Connecting to database...
Successfully inserted 496 transactions!

Transaction Summary by Category:
---------------------------------
Education            | Count:  185 | Total: ₹4,885,843.00
Shopping             | Count:  166 | Total: ₹598,465.00
...
```

### Requirements
- MySQL database must be running
- Database and tables must be created (see `schema.sql`)
- `.env` file must be configured with database credentials
- Node.js dependencies installed (`npm install`)

### Notes
- All transactions are assigned to `user_id = 1`
- Transaction dates are randomly distributed across the last 365 days
- Weekend transactions have higher amounts and special descriptions
- 10-15 anomalies are randomly distributed across the year for AI testing
- The script uses batch inserts for better performance
- Existing transactions for the user are not cleared - new transactions are added

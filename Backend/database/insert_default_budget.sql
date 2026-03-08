USE finai_sentinel;

INSERT IGNORE INTO budget_settings (user_id, monthly_budget, category_budgets, alert_threshold) 
VALUES 
(11, 25000.00, '{"food": 5000, "shopping": 3000, "transport": 2000, "entertainment": 1500, "rent": 8000, "bills": 4000, "healthcare": 2000, "education": 3000, "other": 1500}', 80);

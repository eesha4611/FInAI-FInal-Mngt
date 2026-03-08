-- Create budget_settings table for MySQL
CREATE TABLE IF NOT EXISTS budget_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  monthly_budget DECIMAL(12,2) DEFAULT 0,
  category_budgets JSON,
  alert_threshold INT DEFAULT 80,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_budget_settings_user_id ON budget_settings(user_id);

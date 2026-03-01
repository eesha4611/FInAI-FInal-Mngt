export interface Notification {
  type: "budget" | "threshold" | "system";
  title: string;
  message: string;
  time: string;
  severity?: "low" | "medium" | "high";
  read?: boolean;
}

export interface CategoryData {
  key: string;
  name: string;
  current: number;
}

export interface BudgetData {
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
  alertThreshold: number;
}

export class NotificationService {
  // Generate notifications from budget data
  static generateBudgetNotifications(
    categoryData: CategoryData[],
    budgets: Record<string, number>,
    monthlyBudget: number,
    totalExpenses: number,
    alertThreshold: number
  ): Notification[] {
    const notifications: Notification[] = [];

    // Check category budget overruns
    const exceededBudgets = categoryData
      .map((category) => {
        const budget = budgets[category.key];
        const spent = category.current;

        if (spent > budget) {
          return {
            type: "budget",
            title: "Budget Alert",
            message: `${category.name} exceeded budget by ₹${(spent - budget).toLocaleString()}`,
            time: "Just now",
            severity: "high"
          };
        }

        return null;
      })
      .filter(Boolean) as Notification[];

    notifications.push(...exceededBudgets);

    // Check monthly budget threshold
    const expensePercentage = (totalExpenses / monthlyBudget) * 100;
    if (expensePercentage >= alertThreshold) {
      notifications.push({
        type: "threshold",
        title: "Budget Threshold Alert",
        message: `Monthly expenses reached ${expensePercentage.toFixed(1)}% of budget (₹${totalExpenses.toLocaleString()} of ₹${monthlyBudget.toLocaleString()})`,
        time: "Just now",
        severity: expensePercentage >= 90 ? "high" : "medium"
      });
    }

    return notifications;
  }

  // Store notifications in localStorage
  static storeNotifications(notifications: Notification[]): void {
    if (notifications.length > 0) {
      // Convert to budget alerts format for compatibility
      const budgetAlerts = notifications
        .filter(n => n.type === "budget")
        .map(n => {
          // Extract category name and exceeded amount from message
          const match = n.message.match(/(.+) exceeded budget by ₹([\d,]+)/);
          if (match) {
            return {
              name: match[1],
              exceededBy: parseInt(match[2].replace(/,/g, ''))
            };
          }
          return null;
        })
        .filter(Boolean);

      localStorage.setItem("budgetAlerts", JSON.stringify(budgetAlerts));
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }

  // Get stored notifications
  static getStoredNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem("notifications");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing stored notifications:', error);
      return [];
    }
  }

  // Clear all notifications
  static clearNotifications(): void {
    localStorage.removeItem("budgetAlerts");
    localStorage.removeItem("notifications");
  }

  // Check if there are unread notifications
  static hasUnreadNotifications(): boolean {
    const notifications = this.getStoredNotifications();
    return notifications.length > 0;
  }

  // Get notification count
  static getNotificationCount(): number {
    return this.getStoredNotifications().length;
  }
}

export default NotificationService;

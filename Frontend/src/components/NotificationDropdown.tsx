import React, { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem';

interface Alert {
  name: string;
  exceededBy: number;
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load notifications from localStorage on mount and when they change
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedAlerts = localStorage.getItem('budgetAlerts');
        if (storedAlerts) {
          const alerts = JSON.parse(storedAlerts);
          // Convert alerts to notification format
          const formattedNotifications = alerts.map((alert: Alert) => ({
            type: "budget",
            title: "Budget Alert",
            message: `${alert.name} exceeded budget by ₹${alert.exceededBy.toLocaleString()}`,
            time: "Just now"
          }));
          setNotifications(formattedNotifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error parsing budget alerts:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications' || e.key === 'budgetAlerts') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for immediate updates
    const interval = setInterval(loadNotifications, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const clearNotifications = () => {
    localStorage.removeItem('budgetAlerts');
    localStorage.removeItem('notifications');
    setNotifications([]);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            No budget alerts
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification, index) => (
              <NotificationItem
                key={index}
                title={notification.title}
                message={notification.message}
                time={notification.time}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import NotificationItem from './NotificationItem';

interface Alert {
  name: string;
  exceededBy: number;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const storedAlerts = localStorage.getItem('budgetAlerts');
    if (storedAlerts) {
      try {
        const parsedAlerts = JSON.parse(storedAlerts);
        setAlerts(parsedAlerts);
      } catch (error) {
        console.error('Error parsing budget alerts:', error);
      }
    }
  }, []);

  // Clear alerts when dropdown is opened (optional - you can keep them if you want)
  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const clearAlerts = () => {
    setAlerts([]);
    localStorage.removeItem('budgetAlerts');
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <BellIcon className="h-5 w-5" />
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleClose}
          ></div>
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {alerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No budget alerts
                </div>
              ) : (
                <div className="py-2">
                  {alerts.map((alert, index) => (
                    <NotificationItem
                      key={index}
                      title="Budget Alert"
                      message={`${alert.name} exceeded budget by ₹${alert.exceededBy.toLocaleString()}`}
                      time="Just now"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;

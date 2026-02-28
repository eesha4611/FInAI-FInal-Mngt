import React from 'react';

interface NotificationItemProps {
  title: string;
  message: string;
  time?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ title, message, time }) => {
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors">
      {/* Alert Icon */}
      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
        <span className="text-orange-600 text-sm font-semibold">⚠</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 mt-1">{message}</div>
        {time && (
          <div className="text-xs text-gray-400 mt-1">{time}</div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;

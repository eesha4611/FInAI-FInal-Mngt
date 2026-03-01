// src/components/Layout/Navbar.tsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from '@heroicons/react/24/outline';
import NotificationDropdown from "../NotificationDropdown";
interface NavbarProps {
  onSidebarToggle?: () => void;
  isSidebarCollapsed?: boolean;
  title?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  onSidebarToggle,
  isSidebarCollapsed = false,
  title = "Dashboard",
  showNotifications = true,
  showSearch = true,
}) => {

  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuRef = useRef<HTMLDivElement>(null);

  const [displayName, setDisplayName] = useState("User");
  const [displayEmail, setDisplayEmail] = useState("");

  // 🔹 Load user from localStorage
  const loadUser = () => {
    const profile = JSON.parse(localStorage.getItem("profile") || "null");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const name =
      profile?.full_name ||
      user?.name ||
      user?.email ||
      "User";

    const email = user?.email || "";

    setDisplayName(name);
    setDisplayEmail(email);
  };

  useEffect(() => {
    loadUser();
  }, []);

  // 🔹 Update instantly after profile save
  useEffect(() => {
    const handleProfileUpdate = () => loadUser();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  // 🔹 Update notification count
  useEffect(() => {
    const updateNotificationCount = () => {
      try {
        const stored = localStorage.getItem("budgetAlerts");
        const alerts = stored ? JSON.parse(stored) : [];
        setNotificationCount(alerts.length);
      } catch (error) {
        console.error('Error parsing budget alerts:', error);
        setNotificationCount(0);
      }
    };

    updateNotificationCount();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications' || e.key === 'budgetAlerts') {
        updateNotificationCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for immediate updates
    const interval = setInterval(updateNotificationCount, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 🔹 Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      // Close notification dropdown when clicking outside
      const notificationElement = document.querySelector('[data-notification-dropdown]');
      if (notificationElement && !notificationElement.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-30">
      <div className="px-6 flex justify-between items-center h-16">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          {onSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isSidebarCollapsed ? "☰" : "✕"}
            </button>
          )}

          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-xs text-gray-500 hidden md:block">
              Welcome back, {displayName}
            </p>
          </div>

          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              className="hidden md:block ml-6 border px-3 py-1 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </div>

{/* RIGHT SIDE */}
<div className="flex items-center gap-4">

  {/* NOTIFICATION BELL */}
  {showNotifications && (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      >
        <BellIcon className="h-6 w-6 text-gray-600" />

        {/* notification indicator */}
        {notificationCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50" data-notification-dropdown>
          <NotificationDropdown />
        </div>
      )}
    </div>
  )}

  {/* USER MENU */}
  <div className="relative" ref={userMenuRef}></div>

          {/* USER MENU */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 px-3 py-1 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden md:block text-left">
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-gray-500">{displayEmail}</p>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50">

                <div className="p-4 border-b">
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50"
                >
                  👤 Profile
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50"
                >
                  ⚙️ Settings
                </button>

                <button
                  onClick={() => navigate("/help")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50"
                >
                  ❓ Help Center
                </button>

                <div className="border-t"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
                >
                  🚪 Logout
                </button>

              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
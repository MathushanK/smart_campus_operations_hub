import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

function Navbar() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useNotifications();
  const notificationCount = notifications.filter(n => !n.read).length;

  // Get page title based on route
  const getPageTitle = () => {
    if (location.pathname.includes("admin")) return "Admin Dashboard";
    if (location.pathname.includes("technician")) return "Technician Dashboard";
    if (location.pathname.includes("notifications")) return "Notifications";
    if (location.pathname.includes("resources")) return "Resources";
    if (location.pathname.includes("bookings")) return "Bookings";
    if (location.pathname.includes("incidents")) return "Incidents";
    if (location.pathname.includes("dashboard")) return "Overview";
    return "Overview";
  };

  // Get page icon based on route
  const getPageIcon = () => {
    if (location.pathname.includes("notifications")) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    }
    if (location.pathname.includes("dashboard")) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex justify-between items-center px-6 py-4">
        
        {/* Left - Page Title with Icon */}
        <div className="flex items-center gap-3">
          <div className="text-gray-600">
            {getPageIcon()}
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right - Notifications */}
        <div className="flex items-center gap-6">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-600 hover:text-gray-900 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Notifications ({notificationCount} unread)</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div 
                        key={n.id}
                        className={`flex gap-3 p-3 rounded-lg transition cursor-pointer ${
                          !n.read ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-blue-600" : "bg-gray-400"}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                            {n.title || "Notification"}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Navbar;
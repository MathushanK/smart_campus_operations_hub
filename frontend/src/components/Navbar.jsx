import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

function Navbar() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useNotifications();
  const notificationCount = notifications.filter(n => !n.isRead).length;

  // Get page title based on route
  const getPageTitle = () => {
    if (location.pathname.includes("resources")) return "Resources Management";
    if (location.pathname.includes("admin")) return "Admin Dashboard";
    if (location.pathname.includes("technician")) return "Technician Dashboard";
    if (location.pathname.includes("notifications")) return "Notifications";
    if (location.pathname.includes("bookings")) return "Bookings";
    if (location.pathname.includes("incidents")) return "Incidents";
    if (location.pathname.includes("dashboard")) return "Dashboard";
    return "Overview";
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="flex justify-between items-center px-8 py-5">
        
        {/* Left - Page Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your campus efficiently</p>
          </div>
        </div>

        {/* Right - Notifications & Search */}
        <div className="flex items-center gap-6">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative group p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </div>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 z-50 animate-fade-in">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-transparent">
                  <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                  {notificationCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{notificationCount} unread</p>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          className={`p-4 hover:bg-gray-50 transition cursor-pointer border-l-4 ${
                            !n.isRead ? "border-l-blue-500 bg-blue-50/30" : "border-l-transparent"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${!n.isRead ? "bg-blue-600" : "bg-gray-300"}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                                {n.title || n.message}
                              </p>
                              {n.title && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Time Display */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Navbar;
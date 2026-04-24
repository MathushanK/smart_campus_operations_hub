import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

function Navbar({ onOpenSidebar }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useNotifications();

  const isNotificationRead = (notification) =>
    notification.read ?? notification.isRead ?? false;

  const unreadNotifications = notifications.filter(n => !isNotificationRead(n));
  const notificationCount = unreadNotifications.length;

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

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">

          {/* Mobile sidebar button (from HEAD, FIXED) */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 text-gray-700"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your campus efficiently
            </p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {/* Notifications */}
          <div className="relative">

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
              </svg>

              {notificationCount > 0 && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </div>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border z-50">

                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">
                    {notificationCount} unread
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">

                  {unreadNotifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No unread notifications
                    </div>
                  ) : (
                    unreadNotifications.slice(0, 8).map(n => (
                      <div
                        key={n.id}
                        className="p-4 border-b hover:bg-gray-50"
                      >
                        <p className="font-medium text-sm">
                          {n.title || "Notification"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}

                </div>

              </div>
            )}

          </div>

          {/* Time */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString()}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Navbar;
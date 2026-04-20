import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { LOGOUT_URL } from "../config/runtime";
import { getDashboardPath } from "../utils/auth";

function Sidebar() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dashboardPath = getDashboardPath(user?.role);

  const menuItems = [
    { 
      path: dashboardPath,
      label: "Overview", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      path: "/notifications", 
      label: "Notifications", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },

    {
      path: "/tickets",
      label: user?.role === "technician"
        ? "Manage Tickets"
        : "My Tickets",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
      )
    }
  ];

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase() || "U";
  };

  const handleLogout = () => {
    window.location.href = LOGOUT_URL;
  };

  return (
    <>
      <div className="w-64 h-screen bg-linear-to-b from-blue-700 to-blue-900 text-white p-6 flex flex-col shadow-xl">

        {/* Logo Header */}
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-blue-500">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">CampusFlow</h1>
        </div>

        {/* Menu Section */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-200 uppercase tracking-widest mb-4">
            Menu
          </p>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition duration-200 group"
              >
                <span className="text-blue-300 group-hover:text-white group-hover:scale-110 transition">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* User Info - Clickable */}
        <div 
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 bg-blue-600 bg-opacity-50 rounded-lg p-4 backdrop-blur cursor-pointer hover:bg-opacity-70 transition duration-200 group"
        >
          <div className="w-12 h-12 bg-linear-to-br from-blue-300 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-105 transition">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{user?.name || "User"}</p>
            <p className="text-xs text-blue-200 uppercase tracking-wide">
              {user?.role || "user"}
              {user?.roleId ? ` • role #${user.roleId}` : ""}
            </p>
          </div>
          <svg className="w-4 h-4 text-blue-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-4 animate-in">
            
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Confirm Logout</h3>
            <p className="text-gray-600 text-center mb-8 text-sm">
              Are you sure you want to logout? You'll need to sign in again to access your dashboard.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { LOGOUT_URL } from "../config/runtime";
import { getDashboardPath } from "../utils/auth";

function Sidebar() {
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dashboardPath = getDashboardPath(user?.role);

  const baseMenuItems = [
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
      path:
        user?.role === "admin"
          ? "/admin/tickets"
          : "/tickets",
      label:
        user?.role === "technician"
          ? "My Assigned Tickets"
          : user?.role === "admin"
          ? "Tickets"
          : "My Tickets",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
      )
    }
  ];

  // Add role-specific menu items
  const roleSpecificItems = [];
  
  if (user?.role === "admin") {
    roleSpecificItems.push({
      path: "/admin/bookings",
      label: "Bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    });
    roleSpecificItems.push({
      path: "/admin/resources",
      label: "Resources",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    });
  } else if (user?.role === "user") {
    roleSpecificItems.push({
      path: "/user/bookings",
      label: "My Bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    });
    roleSpecificItems.push({
      path: "/user/resources",
      label: "Browse Resources",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    });
  }

  const menuItems = [...baseMenuItems, ...roleSpecificItems];

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
      <div className="w-72 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col shadow-2xl border-r border-slate-700">

        {/* Logo Header - Modern Design */}
        <div className="mb-12">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition">
              <span>CF</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Campus
              </h1>
              <p className="text-xs text-gray-400 font-semibold -mt-1">Flow</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-4 opacity-50"></div>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
            Navigation
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition duration-300"></div>
                <span className="text-gray-400 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text transition">
                  {item.icon}
                </span>
                <span className="font-semibold text-sm relative">{item.label}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

          {/* Info Section */}
          <div className="space-y-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Account</p>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-200">{user?.name || "User"}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {user?.role === "admin" ? "Administrator" : user?.role === "technician" ? "Technician" : "Student/User"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile - Clickable */}
        <div 
          onClick={() => setShowLogoutModal(true)}
          className="mt-8 flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:border-blue-500/60 rounded-xl cursor-pointer hover:bg-blue-500/30 transition duration-300 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-white truncate">{user?.name?.split(' ')[0] || "User"}</p>
            <p className="text-xs text-gray-400 line-clamp-1">Tap to logout</p>
          </div>
          <svg className="w-5 h-5 text-blue-300 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
      </div>

      {/* Logout Modal - Modern Design */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700 animate-fade-in">
            
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-white text-center mb-3">Logout?</h3>
            <p className="text-gray-300 text-center mb-8 text-sm leading-relaxed">
              You'll need to sign in again to access your dashboard. Are you sure?
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold rounded-xl transition duration-300 shadow-lg hover:shadow-xl"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full px-4 py-3 border border-slate-600 hover:border-slate-500 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-xl transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default Sidebar;

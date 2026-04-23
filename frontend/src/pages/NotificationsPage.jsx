import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiBell, FiTrash2, FiFilter, FiCheck } from "react-icons/fi";

function NotificationsPage() {
  const { notifications, loading, markAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const [filterType, setFilterType] = useState("all"); // all, unread, read

  const formatNotificationDateTime = (createdAt) => {
    if (!createdAt) return "Just now";
    const date = new Date(createdAt);
    const today = new Date().toDateString();
    const nDate = date.toDateString();
    if (nDate === today) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString();
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const filteredNotifications = sortedNotifications.filter(n => {
    if (filterType === "unread") return !n.read;
    if (filterType === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleDelete = (id) => {
    deleteNotification(id);
  };

  // Stats
  const stats = [
    {
      label: "Total Notifications",
      value: notifications.length,
      icon: FiBell,
      color: "indigo",
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: FiFilter,
      color: "amber",
    },
    {
      label: "Read",
      value: notifications.length - unreadCount,
      icon: FiCheck,
      color: "emerald",
    },
  ];

  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <Layout>
      {/* Minimalist Apple-Style Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Notifications
        </h1>
        <p className="text-xl text-gray-500 mt-3 font-light">
          Stay updated with all system notifications
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* FILTER TABS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType("unread")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === "unread"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType("read")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === "read"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {filterType === "all" && "All Notifications"}
            {filterType === "unread" && "Unread Notifications"}
            {filterType === "read" && "Read Notifications"}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 text-lg font-medium">No notifications</p>
              <p className="text-gray-500 text-sm mt-1">
                {filterType === "all" && "You're all caught up!"}
                {filterType === "unread" && "No unread notifications"}
                {filterType === "read" && "No read notifications"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg border transition duration-200 ${
                    !n.read
                      ? "bg-indigo-50 border-indigo-200 hover:border-indigo-300"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!n.read ? "bg-indigo-600" : "bg-gray-400"}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{n.title || "Notification"}</p>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{n.message}</p>
                        </div>
                        {!n.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 shrink-0">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        {formatNotificationDateTime(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 p-2 rounded transition"
                          title="Mark as read"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </Layout>
  );
}

export default NotificationsPage;

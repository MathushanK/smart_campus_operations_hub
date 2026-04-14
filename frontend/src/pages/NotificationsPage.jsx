import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function NotificationsPage() {
  const { notifications, loading, markAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const [filterType, setFilterType] = useState("all"); // all, unread, read

  const filteredNotifications = notifications.filter(n => {
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

  return (
    <Layout>
      {/* HEADER */}
      <div className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-8 mb-8 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2">📢 Notifications</h1>
        <p className="text-blue-100">
          Notifications for user ID {user?.userId ?? user?.id ?? "-"} and role ID {user?.roleId ?? "-"}.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Notifications</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{notifications.length}</h3>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Unread</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{unreadCount}</h3>
            </div>
            <div className="bg-red-100 p-4 rounded-full">
              <span className="text-2xl">🔴</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Read</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{notifications.length - unreadCount}</h3>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

      </div>

      {/* FILTER TABS */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType("unread")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType("read")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            {filterType === "all" && "All Notifications"}
            {filterType === "unread" && "Unread Notifications"}
            {filterType === "read" && "Read Notifications"}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-gray-500 text-lg">No notifications</p>
              <p className="text-gray-400 text-sm mt-2">
                {filterType === "all" && "You're all caught up!"}
                {filterType === "unread" && "No unread notifications"}
                {filterType === "read" && "No read notifications"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-screen">
              {filteredNotifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-5 rounded-lg border-l-4 transition ${
                    !n.read
                      ? "bg-blue-50 border-blue-400 hover:bg-blue-100"
                      : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {/* Icon */}
                  <div className="pt-1">
                    {!n.read ? (
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    ) : (
                      <span className="text-green-600">✓</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={`font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>
                          {n.title || "Notification"}
                        </h3>
                        <p className="text-gray-700 text-sm mt-1">{n.message}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                        !n.read
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-200 text-gray-800"
                      }`}>
                        {!n.read ? "New" : "Read"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                      {n.timestamp ? new Date(n.timestamp).toLocaleString() : "Just now"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      ✕
                    </button>
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

import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { notifications, loading } = useNotifications();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>

      <div className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-8 mb-8 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard 🛠️</h1>
        <p className="text-blue-100">
          Admin view for user ID {user?.userId ?? user?.id ?? "-"} and role ID {user?.roleId ?? "-"}.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-blue-600">
          <h2 className="text-lg font-semibold text-gray-700">Users</h2>
          <p className="text-4xl font-bold mt-3 text-blue-600">120</p>
          <p className="text-sm text-gray-500 mt-2">Active users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-yellow-500">
          <h2 className="text-lg font-semibold text-gray-700">Notifications</h2>
          <p className="text-4xl font-bold mt-3 text-yellow-600">{notifications.length}</p>
          <p className="text-sm text-gray-500 mt-2">{unreadCount} unread</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-700">Tickets</h2>
          <p className="text-4xl font-bold mt-3 text-red-600">12</p>
          <p className="text-sm text-gray-500 mt-2">Open issues</p>
        </div>

      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4">
          <h2 className="text-xl font-bold text-white">📢 System Notifications</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">✨</span>
              <p className="text-gray-500 text-lg">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`flex items-start gap-4 p-4 rounded-lg border-l-4 transition ${
                    !n.read 
                      ? "bg-blue-50 border-blue-400" 
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="text-2xl">{!n.read ? "🔔" : "📭"}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                      {n.title || "System Notification"}
                    </p>
                    <p className="text-gray-700 text-sm mt-1">{n.message}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : "Just now"}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    !n.read ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"
                  }`}>
                    {!n.read ? "New" : "Read"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </Layout>
  );
}

export default AdminDashboard;

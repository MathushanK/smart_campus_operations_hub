import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";

function TechnicianDashboard() {
  const { notifications, loading } = useNotifications();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      
      <div className="bg-linear-to-r from-orange-600 to-orange-400 rounded-2xl p-8 mb-8 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2">Technician Dashboard 🔧</h1>
        <p className="text-orange-100">
          Technician view for user ID {user?.userId ?? user?.id ?? "-"} and role ID {user?.roleId ?? "-"}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Active Tasks</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">8</h3>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Resolved Issues</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">24</h3>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Pending Issues</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{unreadCount}</h3>
            </div>
            <div className="bg-red-100 p-4 rounded-full">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-linear-to-r from-orange-600 to-orange-500 px-6 py-4">
          <h2 className="text-xl font-bold text-white">📢 Work Orders & Notifications</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading work orders...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">😊</span>
              <p className="text-gray-500 text-lg">No pending work orders</p>
              <p className="text-gray-400 text-sm mt-2">All tasks completed!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-lg border-l-4 transition ${
                    !n.read 
                      ? "bg-orange-50 border-orange-400" 
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{!n.read ? "🚨" : "✓"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                          {n.title || "Work Order"}
                        </p>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          !n.read ? "bg-orange-200 text-orange-800" : "bg-gray-200 text-gray-800"
                        }`}>
                          {!n.read ? "PENDING" : "COMPLETED"}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{n.message}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : "Just now"}
                      </p>
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

export default TechnicianDashboard;

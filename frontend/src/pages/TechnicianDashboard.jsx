import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { FiCheckCircle, FiAlertCircle, FiActivity } from "react-icons/fi";

function TechnicianDashboard() {
  const { notifications, loading } = useNotifications();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 rounded-3xl p-8 mb-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-bold">Technician Dashboard</h1>
                <FiActivity className="w-12 h-12" />
              </div>
              <p className="text-rose-100 text-lg">
                Manage work orders and maintenance tasks
              </p>
            </div>
            <div className="text-right">
              <p className="text-rose-200 text-sm">User ID: {user?.userId ?? user?.id ?? "-"}</p>
              <p className="text-rose-300 font-medium mt-2">Technician</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="group relative bg-gradient-to-br from-rose-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition duration-300 border border-rose-100 hover:border-rose-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-rose-500/0 group-hover:from-rose-500/5 group-hover:to-rose-500/5 transition duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-rose-600 text-sm font-semibold uppercase tracking-wide">Active Tasks</p>
              <h3 className="text-4xl font-bold text-rose-900 mt-3">8</h3>
              <p className="text-rose-500 text-xs mt-2">Priority: 3 High</p>
            </div>
            <div className="bg-gradient-to-br from-rose-100 to-rose-50 p-4 rounded-2xl shadow-lg">
              <FiActivity className="w-8 h-8 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition duration-300 border border-emerald-100 hover:border-emerald-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/5 transition duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">Resolved Issues</p>
              <h3 className="text-4xl font-bold text-emerald-900 mt-3">24</h3>
              <p className="text-emerald-500 text-xs mt-2">This month: 18</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 rounded-2xl shadow-lg">
              <FiCheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition duration-300 border border-amber-100 hover:border-amber-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/5 transition duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-semibold uppercase tracking-wide">Pending Issues</p>
              <h3 className="text-4xl font-bold text-amber-900 mt-3">{unreadCount}</h3>
              <p className="text-amber-500 text-xs mt-2">Needs attention</p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-2xl shadow-lg">
              <FiAlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Work Orders Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6" /> Work Orders & Notifications
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              <p className="text-gray-600 mt-4 font-medium">Loading work orders...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">😊</span>
              <p className="text-gray-600 text-lg font-medium">No pending work orders</p>
              <p className="text-gray-500 text-sm mt-2">All tasks completed! Great work</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border-l-4 transition duration-300 ${
                    !n.read 
                      ? "bg-rose-50 border-rose-400 hover:shadow-md" 
                      : "bg-gray-50 border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{!n.read ? "🚨" : "✅"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-lg ${!n.read ? "text-rose-900" : "text-gray-700"}`}>
                          {n.title || "Work Order"}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          !n.read ? "bg-rose-200 text-rose-800" : "bg-green-200 text-green-800"
                        }`}>
                          {!n.read ? "Pending" : "Completed"}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{n.message}</p>
                      <p className="text-gray-500 text-xs mt-2 font-medium">
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

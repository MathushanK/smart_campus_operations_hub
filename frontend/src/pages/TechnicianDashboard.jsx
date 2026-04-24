import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { FiCheckCircle, FiAlertCircle, FiActivity } from "react-icons/fi";

function TechnicianDashboard() {
  const { notifications = [] } = useNotifications();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const userId = user?.userId ?? user?.id ?? "-";
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 rounded-3xl p-8 mb-8 shadow-2xl text-white">
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
            <p className="text-rose-200 text-sm">User ID: {userId}</p>
            <p className="text-rose-300 font-medium mt-2">Technician</p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm text-gray-600">Active Tasks</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">8</h3>
          <p className="text-xs text-gray-500 mt-1">Priority: 3 High</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm text-gray-600">Resolved Issues</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">24</h3>
          <p className="text-xs text-gray-500 mt-1">This month: 18</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <p className="text-sm text-gray-600">Pending Issues</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{unreadCount}</h3>
          <p className="text-xs text-gray-500 mt-1">Needs attention</p>
        </div>

      </div>

      {/* WORK ORDERS */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <div className="bg-rose-600 px-8 py-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5" />
            Work Orders & Notifications
          </h2>
        </div>

        <div className="p-6">

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <p className="text-gray-600 font-medium">No pending work orders</p>
              <p className="text-gray-500 text-sm mt-1">All tasks completed</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">

              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    !n.read ? "bg-rose-50 border-rose-500" : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex gap-3">

                    <div className="text-xl">
                      {!n.read ? "🚨" : "✅"}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-semibold">
                          {n.title || "Work Order"}
                        </p>

                        <span className={`text-xs px-2 py-1 rounded ${
                          !n.read ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                        }`}>
                          {!n.read ? "Pending" : "Completed"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {n.message}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
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
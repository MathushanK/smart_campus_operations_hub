import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const { notifications, loading } = useNotifications();
  const { user } = useAuth();
  const userName = user?.name || "User";
  const navigate = useNavigate();

  return (
    <Layout>
      {/* PREMIUM WELCOME BANNER */}
      <div className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-8 mb-8 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back, User! 👋</h1>
        <p className="text-blue-100">
          Showing notification data for user ID {user?.userId ?? user?.id ?? "-"} and role ID {user?.roleId ?? "-"}.
        </p>
        <p className="text-blue-50 text-sm mt-2">Signed in as {userName}</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Active Bookings</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">5</h3>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Resources Available</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">12</h3>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Pending Requests</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">3</h3>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

      </div>

      {/* NOTIFICATIONS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NOTIFICATIONS SECTION */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">📢 Your Notifications</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🔔</span>
                  <p className="text-gray-500 text-lg">No notifications yet</p>
                  <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 border-l-4 border-blue-400">
                      <div className="text-2xl mt-1">
                        {!n.read ? "📬" : "📭"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                          {n.title || "Notification"}
                        </p>
                        <p className="text-gray-700 text-sm mt-1">{n.message}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : "Just now"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">⚡ Quick Actions</h2>
          </div>
          
          <div className="p-6 space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
              📅 Book Resource
            </button>
            
            <button
              onClick={() => navigate("/tickets/create")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              🔧 Report Issue
            </button>
            
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
              👤 View Profile
            </button>
            
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
              ❓ Get Help
            </button>
          </div>

          {/* Recent Activity */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Recent Activity</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>✓ Booked Lab A - Today</p>
              <p>✓ Report filed - Yesterday</p>
              <p>✓ Resource confirmed - 2 days ago</p>
            </div>
          </div>
        </div>

      </div>

    </Layout>
  );
}

export default UserDashboard;

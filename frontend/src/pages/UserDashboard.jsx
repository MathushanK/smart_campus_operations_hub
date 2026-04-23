import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { FiBox, FiClock, FiCalendar, FiBell, FiAlertCircle } from "react-icons/fi";

function UserDashboard() {
  const { notifications, loading } = useNotifications();
  const { user } = useAuth();
  const userName = user?.name || "User";

  return (
    <Layout>
      {/* Minimalist Apple-Style Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-xl text-gray-500 mt-3 font-light">
          Here's your resource booking overview for today
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl text-indigo-600 bg-indigo-50">
              <FiCalendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-2">Active Bookings</p>
          <p className="text-3xl font-bold text-gray-900">5</p>
          <p className="text-xs text-gray-500 mt-2">↑ 2 from last week</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl text-emerald-600 bg-emerald-50">
              <FiBox className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-2">Available Resources</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-500 mt-2">↓ 3 currently booked</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl text-amber-600 bg-amber-50">
              <FiClock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-2">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting admin review</p>
        </div>

      </div>

      {/* NOTIFICATIONS & INFO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NOTIFICATIONS SECTION */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
                  <p className="text-gray-600 font-medium">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 text-lg font-medium">No notifications yet</p>
                  <p className="text-gray-500 text-sm mt-2">You're all caught up! Check back soon</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`flex items-start gap-3 p-4 rounded-lg border transition ${!n.read ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'} hover:border-gray-300`}>
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-gray-400'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {n.title || "Notification"}
                        </p>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{n.message}</p>
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

        {/* QUICK ACTIONS & INFO */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Quick Links</h2>
          </div>
          
          <div className="p-6 space-y-3">
            <a href="/user/bookings" className="w-full block px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition text-center">
              My Bookings
            </a>
            
            <a href="/user/resources" className="w-full block px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition text-center">
              Browse Resources
            </a>
            
            <a href="/notifications" className="w-full block px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition text-center">
              All Notifications
            </a>
          </div>

          {/* INFO BOX */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-700 leading-relaxed">
                  Bookings require admin approval. You'll be notified once your booking is reviewed.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </Layout>
  );
}

export default UserDashboard;

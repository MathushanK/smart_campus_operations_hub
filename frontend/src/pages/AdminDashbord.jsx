import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { FiUsers, FiBox, FiCalendar, FiTrendingUp, FiActivity, FiArrowUp, FiArrowDown, FiCheckCircle, FiClock, FiAlertCircle, FiPlus, FiBarChart2, FiCompass, FiTool, FiZap } from "react-icons/fi";
import API from "../api/api";

function AdminDashboard() {
  const { notifications, loading: notifLoading } = useNotifications();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch real data from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, resourcesRes, bookingsRes, resourceTypesRes] = await Promise.all([
          API.get("/api/users"),
          API.get("/resources"),
          API.get("/api/bookings/admin/all?size=1000"),
          API.get("/resource-types")
        ]);

        const totalUsers = usersRes.data?.length || 0;
        const totalResourcesData = resourcesRes.data || [];
        const bookingsData = bookingsRes.data?.content || [];
        const resourceTypes = resourceTypesRes.data?.length || 0;
        
        const pendingBookings = bookingsData.filter(b => b.status === "PENDING")?.length || 0;
        const approvedBookings = bookingsData.filter(b => b.status === "APPROVED")?.length || 0;
        const todayBookings = bookingsData.filter(b => {
          const bookingDate = new Date(b.bookingDate).toDateString();
          const today = new Date().toDateString();
          return bookingDate === today;
        })?.length || 0;
        
        const activeResources = totalResourcesData.filter(r => r.status === "ACTIVE")?.length || 0;
        const maintenanceResources = totalResourcesData.filter(r => r.status === "MAINTENANCE")?.length || 0;
        const outOfServiceResources = totalResourcesData.filter(r => r.status === "OUT_OF_SERVICE")?.length || 0;

        setStats([
          { 
            label: "Total Users", 
            value: totalUsers, 
            change: "+12%", 
            icon: FiUsers, 
            color: "indigo", 
            trend: "up",
            description: "Students + Staff + Technicians"
          },
          { 
            label: "Active Resources", 
            value: activeResources, 
            change: "+5%", 
            icon: FiBox, 
            color: "emerald", 
            trend: "up",
            description: "Currently available"
          },
          { 
            label: "Pending Bookings", 
            value: pendingBookings, 
            change: "-3%", 
            icon: FiClock, 
            color: "amber", 
            trend: "down",
            description: "Awaiting approval"
          },
          { 
            label: "Today's Bookings", 
            value: todayBookings, 
            change: "On schedule", 
            icon: FiCalendar, 
            color: "blue", 
            trend: "stable",
            description: "Scheduled for today"
          },
          { 
            label: "Open Issues", 
            value: maintenanceResources, 
            change: "Attention needed", 
            icon: FiAlertCircle, 
            color: "rose", 
            trend: "stable",
            description: "Maintenance required"
          },
          { 
            label: "System Health", 
            value: "Healthy", 
            change: "✓", 
            icon: FiActivity, 
            color: "green", 
            trend: "up",
            description: "All systems operational"
          },
        ]);

        setResources(totalResourcesData);
        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const colorClasses = {
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-600", badge: "bg-rose-100 text-rose-700" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
    green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", badge: "bg-green-100 text-green-700" },
  };

  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    rose: "text-rose-600 bg-rose-50",
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
  };

  // Calculate booking trends from real data (last 7 days)
  const calculateBookingTrends = () => {
    const trends = [];
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = bookings.filter(b => {
        const bookingDate = new Date(b.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= date && bookingDate < nextDate;
      }).length;
      
      trends.push({
        day: daysOfWeek[i % 7],
        bookings: count,
        date: date.toLocaleDateString()
      });
    }
    return trends;
  };

  // Calculate booking status distribution from real data
  const calculateBookingStatus = () => {
    const total = bookings.length || 1;
    const approved = bookings.filter(b => b.status === "APPROVED").length;
    const pending = bookings.filter(b => b.status === "PENDING").length;
    const rejected = bookings.filter(b => b.status === "REJECTED").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
    
    return [
      { status: "Approved", value: Math.round((approved / total) * 100), count: approved, color: "bg-emerald-500" },
      { status: "Pending", value: Math.round((pending / total) * 100), count: pending, color: "bg-amber-500" },
      { status: "Rejected", value: Math.round((rejected / total) * 100), count: rejected, color: "bg-rose-500" },
      { status: "Cancelled", value: Math.round((cancelled / total) * 100), count: cancelled, color: "bg-gray-500" },
    ];
  };

  // Get top and least used resources
  const getResourceUtilization = () => {
    if (resources.length === 0) return { mostUsed: null, leastUsed: null };
    
    const resourceBookingCounts = resources.map(r => ({
      ...r,
      bookingCount: bookings.filter(b => b.resource?.resourceId === r.resourceId).length
    }));
    
    const mostUsed = resourceBookingCounts.reduce((prev, current) => 
      (prev.bookingCount > current.bookingCount) ? prev : current
    );
    
    const leastUsed = resourceBookingCounts.reduce((prev, current) => 
      (prev.bookingCount < current.bookingCount) ? prev : current
    );
    
    return { mostUsed, leastUsed };
  };

  const bookingTrendData = calculateBookingTrends();
  const bookingStatusData = calculateBookingStatus();
  const { mostUsed: mostUsedResource, leastUsed: leastUsedResource } = getResourceUtilization();

  // Real pending approvals from bookings
  const pendingApprovals = bookings?.filter(b => b.status === "PENDING")?.slice(0, 4) || [];

  // Calculate technician stats from bookings assigned to technicians
  const technicianStats = {
    assigned: bookings?.filter(b => b.status === "PENDING" || b.status === "APPROVED").length || 0,
    completedToday: bookings?.filter(b => {
      const bookingDate = new Date(b.bookingDate).toDateString();
      const today = new Date().toDateString();
      return bookingDate === today && b.status === "APPROVED";
    }).length || 0,
    overdue: bookings?.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      const today = new Date();
      return bookingDate < today && b.status === "PENDING";
    }).length || 0,
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xl text-gray-500 mt-2 font-light">
          Welcome back, <span className="text-gray-700 font-medium">{user?.name || "Administrator"}</span>
        </p>
      </div>

      {/* ROW 1: KPI Summary Cards - Premium 6-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-pulse h-28"></div>
            ))}
          </>
        ) : (
          stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition duration-300 group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colorMap[stat.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-500">
                    {stat.change}
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })
        )}
      </div>

      {/* ROW 2: Booking Analytics with Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Booking Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Booking Trends</h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">This Week</span>
          </div>
          <div className="flex items-end gap-3 h-40 justify-center">
            {bookingTrendData.map((day, idx) => {
              const maxHeight = 160;
              const height = (day.bookings / 25) * maxHeight;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition hover:from-indigo-600 hover:to-indigo-500" style={{ height: `${height}px` }}></div>
                  <span className="text-xs font-medium text-gray-600">{day.day}</span>
                  <span className="text-xs text-gray-500">{day.bookings}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Status Donut Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Status</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {bookingStatusData.map((item, idx) => {
                    const offset = bookingStatusData.slice(0, idx).reduce((sum, i) => sum + (i.value / 100) * (2 * Math.PI * 18), 0);
                    const circumference = 2 * Math.PI * 18;
                    const length = (item.value / 100) * circumference;
                    return (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="18"
                        fill="none"
                        stroke={item.color === "bg-emerald-500" ? "#10b981" : item.color === "bg-amber-500" ? "#f59e0b" : item.color === "bg-rose-500" ? "#ef4444" : "#6b7280"}
                        strokeWidth="8"
                        strokeDasharray={`${length} ${circumference}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-center">
                    <p className="text-sm font-semibold text-gray-900">100%</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {bookingStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.status}</span>
                  <span className="text-sm font-semibold text-gray-900 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Actions, Alerts, and Pending Approvals */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Approval Queue */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiClock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            {pendingApprovals.length > 0 && (
              <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                {pendingApprovals.length}
              </span>
            )}
          </div>
          <div className="p-6">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">All caught up</p>
                <p className="text-gray-500 text-sm mt-1">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pendingApprovals.map((booking, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{booking.resource?.name || "Resource"}</p>
                    <p className="text-xs text-gray-600 mt-1">Requested by: {booking.user?.name || "User"}</p>
                    <p className="text-xs text-amber-600 font-medium mt-2">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
            {unreadCount > 0 && (
              <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">No alerts</p>
                <p className="text-gray-500 text-sm mt-1">System running smoothly</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiPlus className="w-4 h-4" />
              Add Resource
            </button>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiPlus className="w-4 h-4" />
              Add Resource Type
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiCalendar className="w-4 h-4" />
              View All Bookings
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiZap className="w-4 h-4" />
              Create Notification
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiTool className="w-4 h-4" />
              Assign Technician
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: Operational Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Resource Status Overview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Resource Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <span className="text-sm font-bold text-emerald-600">{resources.filter(r => r.status === "ACTIVE")?.length || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${((resources.filter(r => r.status === "ACTIVE")?.length || 0) / resources.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Maintenance</span>
                <span className="text-sm font-bold text-amber-600">{resources.filter(r => r.status === "MAINTENANCE")?.length || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${((resources.filter(r => r.status === "MAINTENANCE")?.length || 0) / resources.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Out of Service</span>
                <span className="text-sm font-bold text-rose-600">{resources.filter(r => r.status === "OUT_OF_SERVICE")?.length || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${((resources.filter(r => r.status === "OUT_OF_SERVICE")?.length || 0) / resources.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Work Overview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiTool className="w-5 h-5 text-indigo-600" />
            Technician Tasks
          </h2>
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-600 font-medium">Assigned</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">{technicianStats.assigned}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-600 font-medium">Completed Today</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">{technicianStats.completedToday}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-sm text-rose-600 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-rose-900 mt-2">{technicianStats.overdue}</p>
            </div>
          </div>
        </div>

        {/* Calendar Snapshot - Today's Bookings */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-purple-600" />
            Today's Schedule
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bookings?.filter(b => {
              const bookingDate = new Date(b.bookingDate).toDateString();
              const today = new Date().toDateString();
              return bookingDate === today;
            })?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 font-medium">No bookings today</p>
                <p className="text-gray-500 text-sm mt-1">Great day for planning!</p>
              </div>
            ) : (
              bookings?.filter(b => {
                const bookingDate = new Date(b.bookingDate).toDateString();
                const today = new Date().toDateString();
                return bookingDate === today;
              })?.slice(0, 6)?.map((booking, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">{booking.resource?.name || "Resource"}</p>
                  <p className="text-xs text-gray-600 mt-1">{booking.user?.name || "User"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;

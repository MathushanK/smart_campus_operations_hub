import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiBox, FiCalendar, FiTrendingUp, FiActivity,
  FiArrowUp, FiArrowDown, FiCheckCircle, FiClock, FiAlertCircle,
  FiPlus, FiBarChart2, FiCompass, FiTool, FiZap, FiFilter
} from "react-icons/fi";
import API from "../api/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const { notifications, loading: notifLoading } = useNotifications();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          API.get("/api/users"),
          API.get("/resources"),
          API.get("/api/bookings/admin/all?size=1000"),
          API.get("/resource-types")
        ]);

        // Handle each result individually
        const usersRes = results[0].status === 'fulfilled' ? results[0].value : null;
        const resourcesRes = results[1].status === 'fulfilled' ? results[1].value : null;
        const bookingsRes = results[2].status === 'fulfilled' ? results[2].value : null;
        const resourceTypesRes = results[3].status === 'fulfilled' ? results[3].value : null;

        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`API call ${index} failed:`, result.reason);
          }
        });

        const totalUsers = usersRes?.data?.length || 0;
        const totalResourcesData = resourcesRes?.data || [];

        // BookingAdminPage shows the response is response.data.content || response.data
        const bookingsData = bookingsRes?.data?.content || bookingsRes?.data || [];

        // Sort by createdDate (same as BookingAdminPage)
        const sortedBookings = bookingsData.sort((a, b) => {
          const dateA = new Date(a.createdDate || a.createdAt || 0);
          const dateB = new Date(b.createdDate || b.createdAt || 0);
          return dateB - dateA;
        });

        const pendingBookings = sortedBookings.filter(b => b.status === "PENDING").length;
        const activeResources = totalResourcesData.filter(r => r.status === "ACTIVE").length;
        const maintenanceResources = totalResourcesData.filter(r => r.status === "MAINTENANCE").length;

        // BookingAdminPage uses booking.date (not booking.bookingDate) for the date field
        const todayBookings = sortedBookings.filter(b => {
          const bookingDate = new Date(b.date).toDateString();
          const today = new Date().toDateString();
          return bookingDate === today;
        }).length;

        setStats([
          {
            label: "Total Users",
            value: totalUsers,
            icon: FiUsers,
            color: "indigo",
            description: "Students + Staff + Technicians"
          },
          {
            label: "Active Resources",
            value: activeResources,
            icon: FiBox,
            color: "emerald",
            description: "Currently available"
          },
          {
            label: "Pending Bookings",
            value: pendingBookings,
            icon: FiClock,
            color: "amber",
            description: "Awaiting approval"
          },
          {
            label: "Today's Bookings",
            value: todayBookings,
            icon: FiCalendar,
            color: "blue",
            description: "Scheduled for today"
          },
          {
            label: "Open Issues",
            value: maintenanceResources,
            change: "Attention needed",
            icon: FiAlertCircle,
            color: "rose",
            description: "Maintenance required"
          },
        ]);

        setResources(totalResourcesData);
        setBookings(sortedBookings);
      } catch (err) {
        console.error("Error processing stats:", err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    rose: "text-rose-600 bg-rose-50",
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
  };

  // Calculate booking trends — shows last 7 days
  const calculateBookingTrends = () => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Initialize counts for each day of week
  const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  bookings.forEach(b => {
    const date = new Date(b.date || b.bookingDate);
    if (isNaN(date)) return;

    // getDay() returns 0=Sun,1=Mon,...,6=Sat
    const dayIndex = date.getDay();
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
    if (dayCounts[dayName] !== undefined) {
      dayCounts[dayName]++;
    }
  });

  return daysOfWeek.map(day => ({
    day,
    bookings: dayCounts[day],
  }));
};

  // Booking status distribution
  const calculateBookingStatus = () => {
    const total = bookings.length || 1;
    const approved = bookings.filter(b => b.status === "APPROVED").length;
    const pending  = bookings.filter(b => b.status === "PENDING").length;
    const rejected = bookings.filter(b => b.status === "REJECTED").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;

    return [
      { status: "Approved",  value: Math.round((approved  / total) * 100), count: approved,  color: "bg-emerald-500" },
      { status: "Pending",   value: Math.round((pending   / total) * 100), count: pending,   color: "bg-amber-500"   },
      { status: "Rejected",  value: Math.round((rejected  / total) * 100), count: rejected,  color: "bg-rose-500"    },
      { status: "Cancelled", value: Math.round((cancelled / total) * 100), count: cancelled, color: "bg-gray-500"    },
    ];
  };

  // Resource utilization — uses resourceName (flat field, per BookingAdminPage)
  const getResourceUtilization = () => {
    if (resources.length === 0) return { mostUsed: null, leastUsed: null };

    const counts = resources.map(r => ({
      ...r,
      // BookingAdminPage shows booking.resourceName is a flat string, not booking.resource.name
      bookingCount: bookings.filter(b => b.resourceName === r.name).length
    }));

    return {
      mostUsed:  counts.reduce((prev, cur) => (prev.bookingCount > cur.bookingCount ? prev : cur)),
      leastUsed: counts.reduce((prev, cur) => (prev.bookingCount < cur.bookingCount ? prev : cur)),
    };
  };

  const bookingTrendData = calculateBookingTrends();
  const bookingStatusData = calculateBookingStatus();
  const { mostUsed: mostUsedResource, leastUsed: leastUsedResource } = getResourceUtilization();

  // Pending approvals — BookingAdminPage uses booking.bookingId, booking.userName,
  // booking.userEmail, booking.resourceName, booking.date, booking.startTime, booking.endTime
  const pendingApprovals = bookings.filter(b => b.status === "PENDING").slice(0, 4);

  // Technician stats — uses same status values and booking.date
  const technicianStats = {
    assigned: bookings.filter(b => b.status === "PENDING" || b.status === "APPROVED").length,
    completedToday: bookings.filter(b => {
      const bookingDate = new Date(b.date).toDateString();
      return bookingDate === new Date().toDateString() && b.status === "APPROVED";
    }).length,
    overdue: bookings.filter(b => {
      return new Date(b.date) < new Date() && b.status === "PENDING";
    }).length,
  };

  // Today's bookings — uses booking.date
  const todaysBookings = bookings.filter(b =>
    new Date(b.date).toDateString() === new Date().toDateString()
  );

  return (
    <Layout>
      {/* Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xl text-gray-500 mt-2 font-light">
          Welcome back,{" "}
          <span className="text-gray-700 font-medium">{user?.name || "Administrator"}</span>
        </p>
      </div>

      {/* ROW 1: KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-pulse h-28" />
          ))
        ) : (
          stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colorMap[stat.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })
        )}
      </div>

      {/* ROW 2: Booking Analytics */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Booking Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Booking Trends</h2>
          </div>
          <div className="flex items-end gap-3 h-40 justify-center">
            {bookingTrendData.map((day, idx) => {
              const maxVal = Math.max(...bookingTrendData.map(d => d.bookings), 1);
              const height = (day.bookings / maxVal) * 160;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition hover:from-indigo-600 hover:to-indigo-500"
                    style={{ height: `${Math.max(height, 4)}px` }}
                  />
                  <span className="text-xs font-medium text-gray-600">{day.day}</span>
                  <span className="text-xs text-gray-500">{day.bookings}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Status Donut */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Status</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {bookingStatusData.map((item, idx) => {
                    const circumference = 2 * Math.PI * 15;
                    const offset = bookingStatusData
                      .slice(0, idx)
                      .reduce((sum, i) => sum + (i.value / 100) * circumference, 0);
                    const length = (item.value / 100) * circumference;
                    const strokeColor =
                      item.color === "bg-emerald-500" ? "#10b981"
                      : item.color === "bg-amber-500"  ? "#f59e0b"
                      : item.color === "bg-rose-500"   ? "#ef4444"
                      : "#6b7280";
                    return (
                      <circle
                        key={idx}
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="6"
                        strokeDasharray={`${length} ${circumference}`}
                        strokeDashoffset={-offset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{bookings.length}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {bookingStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.status}</span>
                  <span className="text-sm font-semibold text-gray-900 ml-auto pl-4">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Pending Approvals, Alerts, Quick Actions */}
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
                  <div key={booking.bookingId || idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    {/* FIXED: was booking.resource?.name — correct field is booking.resourceName */}
                    <p className="font-medium text-gray-900 text-sm">
                      {booking.resourceName || "Resource"}
                    </p>
                    {/* FIXED: was booking.user?.name — correct fields are booking.userName / booking.userEmail */}
                    <p className="text-xs text-gray-600 mt-1">
                      {booking.userName || "User"}
                      {booking.userEmail ? ` · ${booking.userEmail}` : ""}
                    </p>
                    {/* FIXED: was booking.bookingDate — correct field is booking.date */}
                    <p className="text-xs text-amber-600 font-medium mt-2">
                      {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                      {booking.startTime && booking.endTime
                        ? ` · ${booking.startTime} – ${booking.endTime}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications / Alerts Panel */}
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

        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button onClick={() => navigate("/admin/resources")} className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiPlus className="w-4 h-4" /> Add Resource
            </button>
            <button onClick={() => navigate("/admin/resources")} className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiPlus className="w-4 h-4" /> Add Resource Type
            </button>
            <button onClick={() => navigate("/admin/bookings")} className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiCalendar className="w-4 h-4" /> View All Bookings
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiZap className="w-4 h-4" /> Create Notification
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiTool className="w-4 h-4" /> Assign Technician
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition duration-200 flex items-center justify-center gap-2">
              <FiBarChart2 className="w-4 h-4" /> View Reports
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: Operational Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Resource Status */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Resource Status</h2>
          <div className="space-y-4">
            {[
              { label: "Active",       status: "ACTIVE",       color: "bg-emerald-500", text: "text-emerald-600" },
              { label: "Maintenance",  status: "MAINTENANCE",  color: "bg-amber-500",   text: "text-amber-600"  },
              { label: "Out of Service", status: "OUT_OF_SERVICE", color: "bg-rose-500", text: "text-rose-600"  },
            ].map(({ label, status, color, text }) => {
              const count = resources.filter(r => r.status === status).length;
              const pct = resources.length ? (count / resources.length) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className={`text-sm font-bold ${text}`}>{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Tasks */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiTool className="w-5 h-5 text-indigo-600" /> Technician Tasks
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

        {/* Today's Schedule */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-purple-600" /> Today's Schedule
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {todaysBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 font-medium">No bookings today</p>
                <p className="text-gray-500 text-sm mt-1">Great day for planning!</p>
              </div>
            ) : (
              todaysBookings.slice(0, 6).map((booking, idx) => (
                <div
                  key={booking.bookingId || idx}
                  className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg"
                >
                  {/* FIXED: was booking.resource?.name — correct field is booking.resourceName */}
                  <p className="text-sm font-semibold text-gray-900">
                    {booking.resourceName || "Resource"}
                  </p>
                  {/* FIXED: was booking.user?.name — correct field is booking.userName */}
                  <p className="text-xs text-gray-600 mt-1">{booking.userName || "User"}</p>
                  {/* ADDED: time range from booking.startTime / booking.endTime */}
                  {booking.startTime && booking.endTime && (
                    <p className="text-xs text-purple-600 font-medium mt-1">
                      {booking.startTime} – {booking.endTime}
                    </p>
                  )}
                  {/* ADDED: purpose */}
                  {booking.purpose && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{booking.purpose}</p>
                  )}
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
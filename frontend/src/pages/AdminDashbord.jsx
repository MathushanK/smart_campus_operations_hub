import Layout from "../components/Layout";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiBox, FiCalendar, FiBarChart2,
  FiClock, FiAlertCircle, FiPlus, FiTool, FiZap
} from "react-icons/fi";
import API from "../api/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const { notifications = [] } = useNotifications();
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
        ]);

        const usersRes = results[0].status === "fulfilled" ? results[0].value : null;
        const resourcesRes = results[1].status === "fulfilled" ? results[1].value : null;
        const bookingsRes = results[2].status === "fulfilled" ? results[2].value : null;

        const totalUsers = usersRes?.data?.length || 0;
        const totalResources = resourcesRes?.data || [];
        const bookingsData = bookingsRes?.data?.content || bookingsRes?.data || [];

        const sortedBookings = [...bookingsData].sort((a, b) =>
          new Date(b.createdDate || b.createdAt || 0) -
          new Date(a.createdDate || a.createdAt || 0)
        );

        const pendingBookings = sortedBookings.filter(b => b.status === "PENDING").length;
        const activeResources = totalResources.filter(r => r.status === "ACTIVE").length;
        const maintenanceResources = totalResources.filter(r => r.status === "MAINTENANCE").length;

        const today = new Date().toDateString();
        const todayBookings = sortedBookings.filter(
          b => new Date(b.date).toDateString() === today
        ).length;

        setStats([
          {
            label: "Total Users",
            value: totalUsers,
            icon: FiUsers,
            color: "indigo"
          },
          {
            label: "Active Resources",
            value: activeResources,
            icon: FiBox,
            color: "emerald"
          },
          {
            label: "Pending Bookings",
            value: pendingBookings,
            icon: FiClock,
            color: "amber"
          },
          {
            label: "Today's Bookings",
            value: todayBookings,
            icon: FiCalendar,
            color: "blue"
          },
          {
            label: "Open Issues",
            value: maintenanceResources,
            icon: FiAlertCircle,
            color: "rose"
          }
        ]);

        setResources(totalResources);
        setBookings(sortedBookings);

      } catch (err) {
        console.error("Dashboard error:", err);
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
  };

  const pendingApprovals = bookings.filter(b => b.status === "PENDING").slice(0, 5);

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-10 mt-2">
        <h1 className="text-5xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, {user?.name || "Administrator"}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">

        {loading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
            ))
          : stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border rounded-xl p-4">
                  <div className={`p-2 w-fit rounded ${colorMap[s.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              );
            })}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white border rounded-2xl p-6">
          <h2 className="font-semibold mb-3">Quick Actions</h2>

          <button onClick={() => navigate("/admin/resources")}
            className="w-full bg-indigo-600 text-white py-2 rounded mb-2">
            <FiPlus className="inline mr-2" /> Add Resource
          </button>

          <button onClick={() => navigate("/admin/bookings")}
            className="w-full bg-gray-100 py-2 rounded">
            <FiCalendar className="inline mr-2" /> View Bookings
          </button>
        </div>

        {/* ALERTS */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="font-semibold mb-3">
            Alerts ({unreadCount})
          </h2>

          {notifications.length === 0 ? (
            <p className="text-gray-500">No alerts</p>
          ) : (
            notifications.slice(0, 5).map(n => (
              <div key={n.id} className="text-sm border-b py-2">
                {n.title || n.message}
              </div>
            ))
          )}
        </div>

        {/* SUMMARY */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="font-semibold mb-3">Summary</h2>
          <p>Total Bookings: {bookings.length}</p>
          <p>Pending: {pendingApprovals.length}</p>
        </div>

      </div>

    </Layout>
  );
}

export default AdminDashboard;
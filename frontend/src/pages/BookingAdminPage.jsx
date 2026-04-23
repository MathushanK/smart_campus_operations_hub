import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiSearch, FiFilter, FiCheck, FiTrash2 } from "react-icons/fi";

function BookingAdminPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filter state
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBookingId, setRejectingBookingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Load bookings on mount and filter changes
  useEffect(() => {
    fetchAllBookings();
  }, [keyword, statusFilter]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      let url = `/api/bookings/admin/all?size=1000`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await API.get(url);
      const bookingsData = response.data.content || response.data || [];
      
      // Sort bookings by creation date (most recent first)
      const sortedBookings = bookingsData.sort((a, b) => {
        const dateA = new Date(a.createdDate || a.createdAt || 0);
        const dateB = new Date(b.createdDate || b.createdAt || 0);
        return dateB - dateA;
      });
      
      setBookings(sortedBookings);
      setError("");
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve this booking?")) return;

    try {
      await API.patch(`/api/bookings/${bookingId}/approve`);
      setSuccess("Booking approved successfully!");
      fetchAllBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to approve booking";
      setError(errorMsg);
    }
  };

  const handleRejectClick = (bookingId) => {
    setRejectingBookingId(bookingId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    try {
      await API.patch(`/api/bookings/${rejectingBookingId}/reject`, {
        reason: rejectReason
      });
      setSuccess("Booking rejected successfully!");
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingBookingId(null);
      fetchAllBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to reject booking";
      setError(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-amber-100 text-amber-800",
      APPROVED: "bg-emerald-100 text-emerald-800",
      REJECTED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100";
  };

  // Stats
  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: FiCalendar,
      color: "indigo",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "PENDING").length,
      icon: FiClock,
      color: "amber",
    },
    {
      label: "Approved",
      value: bookings.filter((b) => b.status === "APPROVED").length,
      icon: FiCheckCircle,
      color: "emerald",
    },
    {
      label: "Rejected",
      value: bookings.filter((b) => b.status === "REJECTED").length,
      icon: FiAlertCircle,
      color: "red",
    },
  ];

  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
    red: "text-red-600 bg-red-50",
  };

  return (
    <Layout>
      {/* Minimalist Apple-Style Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Bookings
        </h1>
        <p className="text-xl text-gray-500 mt-3 font-light">
          Review and manage all booking requests
        </p>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg mb-4 flex justify-between items-center">
          <span className="font-medium">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800 font-bold text-lg"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-lg mb-4 flex items-center gap-3">
          <span className="text-lg font-bold">✓</span>
          <span className="font-medium">{success}</span>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-lg mb-4">
          Loading...
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* BOOKINGS TABLE SECTION */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div></div>
          <button
            onClick={() => {
              setKeyword("");
              setStatusFilter("");
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium px-4 py-2 rounded-lg transition"
          >
            Clear
          </button>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">User</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">Resource</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">Date & Time</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">Purpose</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">Status</th>
                {bookings.some(b => b.status === "PENDING") && (
                  <th className="px-4 py-4 text-center font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.bookingId} className="border-b border-gray-200 hover:bg-blue-50 transition duration-150">
                  <td className="px-4 py-4 text-gray-900">
                    <div>
                      <p className="font-medium">{booking.userName || "N/A"}</p>
                      <p className="text-sm text-gray-500">{booking.userEmail || "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-700 font-medium">{booking.resourceName || "N/A"}</td>
                  <td className="px-4 py-4 text-gray-700">
                    <div>
                      <p className="font-medium">{booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}</p>
                      <p className="text-sm text-gray-500">{booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm max-w-xs truncate" title={booking.purpose}>{booking.purpose || "N/A"}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  {bookings.some(b => b.status === "PENDING") && (
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.bookingId)}
                              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-s font-medium transition"
                              title="Approve"
                            >
                              <FiCheck className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(booking.bookingId)}
                              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-s font-medium transition"
                              title="Reject"
                            >
                              <FiX className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status !== "PENDING" && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50">
              <FiFilter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No bookings found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Booking</h2>
            <p className="text-gray-600 mb-6">Please provide a reason for rejecting this booking.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default BookingAdminPage;

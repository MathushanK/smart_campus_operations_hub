import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";

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
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100";
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-500",
      APPROVED: "bg-green-500",
      REJECTED: "bg-red-500",
      CANCELLED: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  // Stats
  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: "📅",
      color: "blue",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "PENDING").length,
      icon: "⏳",
      color: "yellow",
    },
    {
      label: "Approved",
      value: bookings.filter((b) => b.status === "APPROVED").length,
      icon: "✅",
      color: "green",
    },
    {
      label: "Rejected",
      value: bookings.filter((b) => b.status === "REJECTED").length,
      icon: "❌",
      color: "red",
    },
  ];

  return (
    <Layout>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 mb-8 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2">Booking Management 📋</h1>
        <p className="text-purple-100">Review, approve, and manage all user bookings</p>
        <p className="text-purple-50 text-sm mt-2">Admin - {user?.name}</p>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button
            onClick={() => setError("")}
            className="float-right font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          ✓ {success}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const bgColorMap = {
            blue: "bg-blue-100",
            yellow: "bg-yellow-100",
            green: "bg-green-100",
            red: "bg-red-100",
          };
          const textColorMap = {
            blue: "text-blue-800",
            yellow: "text-yellow-800",
            green: "text-green-800",
            red: "text-red-800",
          };

          return (
            <div key={idx} className={`${bgColorMap[stat.color]} rounded-xl p-6 shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${textColorMap[stat.color]}`}>
                    {stat.label}
                  </p>
                  <h3 className={`text-3xl font-bold ${textColorMap[stat.color]} mt-2`}>
                    {stat.value}
                  </h3>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Search & Filter Bookings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Search (Purpose, Resource, User, Email)
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
              placeholder="Search bookings..."
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setKeyword("");
                setStatusFilter("");
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No bookings found</div>
        ) : (
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.bookingId} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {booking.userName}
                        </p>
                        <p className="text-sm text-gray-500">{booking.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {booking.resourceName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.resourceLocation}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-800">
                        <p className="font-semibold">{booking.date}</p>
                        <p className="text-gray-500">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {booking.purpose}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.bookingId)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition text-sm font-semibold"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(booking.bookingId)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm font-semibold"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {booking.status !== "PENDING" && (
                          <span className="text-gray-400 text-sm">
                            No actions
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EXPANDABLE DETAILS (Mobile) */}
      <div className="hidden md:hidden space-y-4 mt-8">
        {bookings.map((booking) => (
          <div
            key={booking.bookingId}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {booking.resourceName}
                </h3>
                <p className="text-sm text-gray-500">{booking.userName}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-semibold text-gray-800">{booking.date}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-semibold text-gray-800">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-semibold text-gray-800">
                  {booking.resourceLocation}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold text-gray-800">{booking.status}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">
              <strong>Purpose:</strong> {booking.purpose}
            </p>

            {booking.adminReason && (
              <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                <p className="text-sm">
                  <strong>Rejection Reason:</strong> {booking.adminReason}
                </p>
              </div>
            )}

            {booking.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(booking.bookingId)}
                  className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition text-sm font-semibold"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleRejectClick(booking.bookingId)}
                  className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm font-semibold"
                >
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* REJECTION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reject Booking</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this booking. The user will be notified.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows="5"
            />

            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectingBookingId(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default BookingAdminPage;

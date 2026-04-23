import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import { FiCalendar, FiBriefcase, FiClock, FiUsers, FiAlertCircle, FiCheckCircle, FiX, FiBox } from "react-icons/fi";

function BookingUserPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });
  const [editing, setEditing] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [conflictCheck, setConflictCheck] = useState(null);

  // Search & Filter state
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Load resources for dropdown
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await API.get("/resources?status=ACTIVE");
        setResources(response.data || []);
      } catch (err) {
        console.error("Error loading resources:", err);
      }
    };
    fetchResources();
  }, []);

  // Load user bookings
  useEffect(() => {
    fetchUserBookings();
  }, [keyword, statusFilter, currentPage]);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      let url = `/api/bookings?page=${currentPage}&size=10`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await API.get(url);
      setBookings(response.data.content || response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format time to HH:MM:SS if it's in HH:MM format
  const formatTimeToBackend = (time) => {
    if (!time) return "";
    if (time.length === 5) {
      return `${time}:00`; // HH:MM -> HH:MM:SS
    }
    return time; // Already HH:MM:SS
  };

  // Format time from backend (HH:MM:SS) to input format (HH:MM)
  const formatTimeForInput = (time) => {
    if (!time) return "";
    return time.substring(0, 5); // Take only HH:MM
  };

  // Handle resource selection
  const handleResourceChange = (e) => {
    const resourceId = parseInt(e.target.value);
    const resource = resources.find((r) => r.resourceId === resourceId);
    setSelectedResource(resource);
    setFormData({ ...formData, resourceId });
    // Clear time and conflict errors when resource changes
    const newFormErrors = { ...formErrors };
    delete newFormErrors.time;
    delete newFormErrors.conflict;
    setFormErrors(newFormErrors);
    setConflictCheck(null);
  };

  // Check for conflicts in real-time
  const checkConflicts = async (resourceId, date, startTime, endTime, excludeBookingId = null) => {
    if (!resourceId || !date || !startTime || !endTime) return;

    try {
      const params = {
        resourceId,
        date,
        startTime: formatTimeToBackend(startTime),
        endTime: formatTimeToBackend(endTime),
      };
      
      if (excludeBookingId) {
        params.excludeBookingId = excludeBookingId;
      }
      
      const response = await API.get("/api/bookings/check-conflicts", { params });
      setConflictCheck(response.data);
    } catch (err) {
      console.error("Error checking conflicts:", err);
    }
  };

  // Handle time change to trigger real-time conflict check and clear errors
  const handleTimeChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear time-related errors
    const newFormErrors = { ...formErrors };
    delete newFormErrors.startTime;
    delete newFormErrors.endTime;
    delete newFormErrors.time;
    delete newFormErrors.conflict;
    setFormErrors(newFormErrors);
    setConflictCheck(null);

    // Validate availability window in real-time
    if (selectedResource && formData.date) {
      const newStartTime = field === "startTime" ? value : formData.startTime;
      const newEndTime = field === "endTime" ? value : formData.endTime;
      
      if (newStartTime && newEndTime) {
        const resStart = selectedResource.availabilityStart?.substring(0, 5);
        const resEnd = selectedResource.availabilityEnd?.substring(0, 5);

        // Check if times are within availability window
        if (newStartTime < resStart || newEndTime > resEnd) {
          const availabilityError = `Booking must be within availability window (${resStart} - ${resEnd}).`;
          setFormErrors((prev) => ({ ...prev, time: availabilityError }));
          return; // Don't check conflicts if outside availability window
        }
      }
    }

    // Trigger conflict check if all required fields are filled
    if (
      formData.resourceId &&
      formData.date &&
      formData.startTime &&
      formData.endTime
    ) {
      // Check conflicts with the updated time
      const newStartTime = field === "startTime" ? value : formData.startTime;
      const newEndTime = field === "endTime" ? value : formData.endTime;
      
      checkConflicts(
        formData.resourceId,
        formData.date,
        newStartTime,
        newEndTime,
        editing
      );
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.resourceId) errors.resourceId = "Resource is required";
    if (!formData.date) errors.date = "Date is required";
    if (formData.date < today) errors.date = "Date must be today or in the future";
    if (!formData.startTime) errors.startTime = "Start time is required";
    if (!formData.endTime) errors.endTime = "End time is required";
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = "End time must be after start time";
    }

    // Check availability window (inclusive boundaries)
    if (selectedResource) {
      const start = formData.startTime;
      const end = formData.endTime;
      const resStart = selectedResource.availabilityStart?.substring(0, 5);
      const resEnd = selectedResource.availabilityEnd?.substring(0, 5);

      // Use explicit comparison: start >= resStart AND end <= resEnd
      if (start < resStart || end > resEnd) {
        errors.time =
          `Booking must be within availability window (${resStart} - ${resEnd}).`;
      }

      // Check attendees is required if resource has capacity
      if (selectedResource.capacity) {
        if (!formData.attendees || parseInt(formData.attendees) === 0) {
          errors.attendees = "Expected attendees is required for this resource";
        } else if (parseInt(formData.attendees) > selectedResource.capacity) {
          errors.attendees = `Attendees exceed capacity (${selectedResource.capacity})`;
        }
      }
    }

    if (!formData.purpose) errors.purpose = "Purpose is required";

    // Check conflicts from real-time check
    if (conflictCheck?.hasConflict) {
      errors.conflict = "Time slot is already booked. Please choose a different time";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        resourceId: parseInt(formData.resourceId),
        date: formData.date,
        startTime: formatTimeToBackend(formData.startTime),
        endTime: formatTimeToBackend(formData.endTime),
        purpose: formData.purpose,
        attendees: formData.attendees ? parseInt(formData.attendees) : null,
      };

      if (editing) {
        // Update booking
        await API.put(`/api/bookings/${editing}`, payload);
        setSuccess("Booking updated successfully!");
        setEditing(null);
      } else {
        // Create booking
        await API.post("/api/bookings", payload);
        setSuccess("Booking created successfully!");
      }

      // Reset form
      setFormData({
        resourceId: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendees: "",
      });
      setSelectedResource(null);
      setShowForm(false);
      setConflictCheck(null);

      // Refresh bookings
      fetchUserBookings();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save booking";
      
      // Check if it's a conflict error and display it below the times
      if (errorMsg.includes("Time slot is already booked")) {
        setFormErrors({ ...formErrors, conflict: errorMsg });
        setError("");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (booking) => {
    setEditing(booking.bookingId);
    setShowForm(true);
    setSelectedResource(
      resources.find((r) => r.resourceId === booking.resourceId) || null
    );
    setFormData({
      resourceId: booking.resourceId,
      date: booking.date,
      startTime: formatTimeForInput(booking.startTime),
      endTime: formatTimeForInput(booking.endTime),
      purpose: booking.purpose,
      attendees: booking.attendees || "",
    });
  };

  // Handle cancel
  const handleCancel = async (bookingId, status) => {
    const message = status === "PENDING" ? "Are you sure you want to remove this booking?" : "Are you sure you want to cancel this booking?";
    if (!window.confirm(message)) return;

    try {
      // Use DELETE for PENDING bookings (remove from database), PATCH for others (change status)
      const endpoint = status === "PENDING" ? `/api/bookings/${bookingId}` : `/api/bookings/${bookingId}/cancel`;
      const method = status === "PENDING" ? API.delete : API.patch;
      await method(endpoint);
      const successMsg = status === "PENDING" ? "Booking removed successfully!" : "Booking cancelled successfully!";
      setSuccess(successMsg);
      fetchUserBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to process booking";
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

  return (
    <Layout>
      {/* Minimalist Apple-Style Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          My Bookings
        </h1>
        <p className="text-xl text-gray-500 mt-3 font-light">
          Create, manage, and track your resource bookings
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Bookings */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg text-indigo-600 bg-indigo-50">
              <FiCalendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Total Bookings
          </p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>

        {/* Approved */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg text-emerald-600 bg-emerald-50">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Approved
          </p>
          <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === "APPROVED").length}</p>
        </div>

        {/* Pending */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg text-amber-600 bg-amber-50">
              <FiClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Pending
          </p>
          <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === "PENDING").length}</p>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg text-rose-600 bg-rose-50">
              <FiX className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Rejected
          </p>
          <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === "REJECTED").length}</p>
        </div>
      </div>

      {/* BOOKINGS LIST */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditing(null);
                setFormData({
                  resourceId: "",
                  date: "",
                  startTime: "",
                  endTime: "",
                  purpose: "",
                  attendees: "",
                });
                setSelectedResource(null);
                setFormErrors({});
                setConflictCheck(null);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition text-base"
          >
            {editing ? "✕ Cancel" : "+ New Booking"}
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{editing ? "Edit Booking" : "New Booking"}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resource Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resource <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.resourceId}
                onChange={handleResourceChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.resourceId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a resource</option>
                {Object.entries(
                  resources.reduce((acc, r) => {
                    const type = r.typeName || "Uncategorized";
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(r);
                    return acc;
                  }, {})
                ).map(([typeName, typeResources]) => (
                  <optgroup key={typeName} label={typeName}>
                    {typeResources.map((r) => (
                      <option key={r.resourceId} value={r.resourceId}>
                        {r.name} - {r.location}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {selectedResource && (
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Available: {selectedResource.availabilityStart} - {selectedResource.availabilityEnd}
                  {selectedResource.capacity && (
                    <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold text-xs">
                      Max {selectedResource.capacity}
                    </span>
                  )}
                </p>
              )}
              {formErrors.resourceId && (
                <p className="text-red-500 text-sm mt-1 font-medium">⚠️ {formErrors.resourceId}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  const newFormErrors = { ...formErrors };
                  delete newFormErrors.time;
                  delete newFormErrors.conflict;
                  setFormErrors(newFormErrors);
                  setConflictCheck(null);
                }}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1 font-medium">⚠️ {formErrors.date}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange("startTime", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.startTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.startTime && (
                  <p className="text-red-500 text-sm mt-1 font-medium">⚠️ {formErrors.startTime}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange("endTime", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.endTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.endTime && (
                  <p className="text-red-500 text-sm mt-1 font-medium">⚠️ {formErrors.endTime}</p>
                )}
              </div>
            </div>

            {/* Conflict Check & Time Errors */}
            {(conflictCheck?.hasConflict || formErrors.time || formErrors.conflict) && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">
                {conflictCheck?.hasConflict && <div>⚠️ {conflictCheck.message}</div>}
                {formErrors.time && <div>⚠️ {formErrors.time}</div>}
                {formErrors.conflict && <div>⚠️ {formErrors.conflict}</div>}
              </div>
            )}

            {/* Purpose */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                placeholder="What will you use this resource for?"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.purpose ? "border-red-500" : "border-gray-300"
                }`}
                rows="3"
              />
              {formErrors.purpose && (
                <p className="text-red-500 text-sm mt-1 font-medium">⚠️ {formErrors.purpose}</p>
              )}
            </div>

            {/* Attendees */}
            {selectedResource?.capacity && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Attendees <span className="text-red-500">*</span>
                  <span className="text-gray-500 font-normal"> (Max: {selectedResource.capacity})</span>
                </label>
                <input
                  type="number"
                  value={formData.attendees}
                  onChange={(e) =>
                    setFormData({ ...formData, attendees: e.target.value })
                  }
                  min="1"
                  max={selectedResource.capacity}
                  placeholder="Number of attendees"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.attendees ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.attendees && (
                  <p className="text-red-500 text-sm mt-1 font-medium">⚠️ {formErrors.attendees}</p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Saving..." : editing ? "Update Booking" : "Create Booking"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setFormData({
                    resourceId: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    purpose: "",
                    attendees: "",
                  });
                  setSelectedResource(null);
                  setFormErrors({});
                  setConflictCheck(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
              </form>
            </div>
          </div>
        )}

        {/* SEARCH & FILTER */}
        <div className="px-8 py-6 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(0);
                }}
                placeholder="Search..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition text-sm"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition text-sm"
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
                  setCurrentPage(0);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2.5 rounded-lg transition text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>


        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <p className="text-gray-600 text-lg font-medium">No bookings found</p>
            <p className="text-gray-500 text-sm mt-2">Create a new booking to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {[...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((booking) => (
              <div
                key={booking.bookingId}
                className="px-6 py-5 hover:bg-slate-100 hover:bg-blue-50/30 transition-all duration-200 border-l-4 border-gray-200 hover:border-blue-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.resourceName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.resourceType} • {booking.resourceLocation}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Date</p>
                    <p className="font-semibold text-gray-900 mt-1">{booking.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Time</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  {booking.attendees && (
                    <div>
                      <p className="text-gray-600 font-medium">Attendees</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {booking.attendees} / {booking.resourceCapacity}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 font-medium">Created</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm">
                  <strong>Purpose:</strong> {booking.purpose}
                </p>

                {booking.adminReason && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {booking.adminReason}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {booking.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleEdit(booking)}
className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition duration-200 shadow-sm"                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleCancel(booking.bookingId, "PENDING")}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition duration-200 shadow-sm"
                      >
                        ✕ Remove
                      </button>
                    </>
                  )}
                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => handleCancel(booking.bookingId, "APPROVED")}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition duration-200 shadow-sm"
                    >
                      ✕ Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default BookingUserPage;

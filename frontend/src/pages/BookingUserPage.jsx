import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";

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

  // Handle resource selection
  const handleResourceChange = (e) => {
    const resourceId = parseInt(e.target.value);
    const resource = resources.find((r) => r.resourceId === resourceId);
    setSelectedResource(resource);
    setFormData({ ...formData, resourceId });
    setConflictCheck(null);
  };

  // Check for conflicts in real-time
  const checkConflicts = async (resourceId, date, startTime, endTime, excludeBookingId = null) => {
    if (!resourceId || !date || !startTime || !endTime) return;

    try {
      const params = {
        resourceId,
        date,
        startTime,
        endTime,
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

  // Handle time change to trigger real-time conflict check
  const handleTimeChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Trigger conflict check if all required fields are filled
    if (
      formData.resourceId &&
      formData.date &&
      field === "endTime" &&
      formData.startTime
    ) {
      checkConflicts(
        formData.resourceId,
        formData.date,
        formData.startTime,
        value,
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
    // If window is 08:00-17:00, you can book 08:00-17:00 (includes both boundaries)
    if (selectedResource) {
      const start = formData.startTime;
      const end = formData.endTime;
      const resStart = selectedResource.availabilityStart?.substring(0, 5);
      const resEnd = selectedResource.availabilityEnd?.substring(0, 5);

      // Use explicit comparison: start >= resStart AND end <= resEnd
      if (start < resStart || end > resEnd) {
        errors.time =
          `Booking must be within availability window (${resStart} - ${resEnd}). Both boundaries are inclusive.`;
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
        startTime: formData.startTime,
        endTime: formData.endTime,
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
      setError(errorMsg);
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
      startTime: booking.startTime,
      endTime: booking.endTime,
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
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 mb-8 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2">My Bookings 📅</h1>
        <p className="text-blue-100">Create, manage, and track your resource bookings</p>
        <p className="text-blue-50 text-sm mt-2">Signed in as {user?.name}</p>
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

      {/* CREATE/EDIT BOOKING FORM */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div
          className="flex justify-between items-center cursor-pointer"
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
        >
          <h2 className="text-2xl font-bold text-gray-800">
            {editing ? "Edit Booking" : "New Booking"}
          </h2>
          <span className="text-2xl">{showForm ? "▼" : "▶"}</span>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Resource Selection */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Resource *
              </label>
              <select
                value={formData.resourceId}
                onChange={handleResourceChange}
                className={`w-full p-3 border rounded-lg ${
                  formErrors.resourceId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a resource</option>
                {resources.map((r) => (
                  <option key={r.resourceId} value={r.resourceId}>
                    {r.name} - {r.location}
                  </option>
                ))}
              </select>
              {selectedResource && (
                <p className="text-sm text-blue-600 mt-2">
                  📍 Available: {selectedResource.availabilityStart} -{" "}
                  {selectedResource.availabilityEnd}
                  {selectedResource.capacity && (
                    <span className="ml-2 bg-blue-100 px-2 py-1 rounded">
                      Max {selectedResource.capacity}
                    </span>
                  )}
                </p>
              )}
              {formErrors.resourceId && (
                <p className="text-red-500 text-sm">{formErrors.resourceId}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full p-3 border rounded-lg ${
                  formErrors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.date && (
                <p className="text-red-500 text-sm">{formErrors.date}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className={`w-full p-3 border rounded-lg ${
                    formErrors.startTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.startTime && (
                  <p className="text-red-500 text-sm">{formErrors.startTime}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange("endTime", e.target.value)}
                  className={`w-full p-3 border rounded-lg ${
                    formErrors.endTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.endTime && (
                  <p className="text-red-500 text-sm">{formErrors.endTime}</p>
                )}
              </div>
            </div>

            {/* Conflict Check */}
            {conflictCheck && conflictCheck.hasConflict && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {`⚠️ ${conflictCheck.message}`}
              </div>
            )}
            {formErrors.time && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ⚠️ {formErrors.time}
              </div>
            )}
            {formErrors.conflict && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ⚠️ {formErrors.conflict}
              </div>
            )}

            {/* Purpose */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Purpose *
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                placeholder="What will you use this resource for?"
                className={`w-full p-3 border rounded-lg ${
                  formErrors.purpose ? "border-red-500" : "border-gray-300"
                }`}
                rows="3"
              />
              {formErrors.purpose && (
                <p className="text-red-500 text-sm">{formErrors.purpose}</p>
              )}
            </div>

            {/* Attendees (only if capacity exists) */}
            {selectedResource?.capacity && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Expected Attendees * (Max: {selectedResource.capacity})
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
                  className={`w-full p-3 border rounded-lg ${
                    formErrors.attendees ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.attendees && (
                  <p className="text-red-500 text-sm">{formErrors.attendees}</p>
                )}
              </div>
            )}
          

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                {loading ? "Saving..." : editing ? "Update Booking" : "Create Booking"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setFormErrors({});
                  setConflictCheck(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Your Bookings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Search by Purpose or Resource
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search..."
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
                setCurrentPage(0);
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
                setCurrentPage(0);
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* BOOKINGS LIST */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Your Bookings</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No bookings found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {[...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((booking) => (
              <div
                key={booking.bookingId}
                className="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {booking.resourceName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {booking.resourceType} • {booking.resourceLocation}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
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
                  {booking.attendees && (
                    <div>
                      <p className="text-gray-500">Attendees</p>
                      <p className="font-semibold text-gray-800">
                        {booking.attendees} / {booking.resourceCapacity}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {booking.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleEdit(booking)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleCancel(booking.bookingId, "PENDING")}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm"
                      >
                        ✕ Remove
                      </button>
                    </>
                  )}
                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => handleCancel(booking.bookingId, "APPROVED")}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm"
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

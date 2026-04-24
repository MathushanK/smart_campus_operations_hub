import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiBox, FiMapPin, FiUsers, FiClock, FiCheck, FiAlertCircle, FiX } from "react-icons/fi";

function ResourcesAdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Resource Types state
  const [resourceTypes, setResourceTypes] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeFormData, setTypeFormData] = useState({ typeId: null, typeName: "" });

  // Resources state
  const [resources, setResources] = useState([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [resourceFormData, setResourceFormData] = useState({
    resourceId: null,
    name: "",
    typeId: "",
    location: "",
    capacity: "",
    availabilityStart: "08:00",
    availabilityEnd: "18:00",
    status: "ACTIVE",
  });

  // Search & Filter state
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Delete confirmation modal
  const [showDeleteTypeModal, setShowDeleteTypeModal] = useState(false);
  const [deletingTypeId, setDeletingTypeId] = useState(null);
  const [deletingTypeResourceCount, setDeletingTypeResourceCount] = useState(0);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchAllData();
  }, [typeFilter, statusFilter, searchKeyword]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [typesRes, resourcesRes] = await Promise.all([
        API.get("/resource-types"),
        API.get("/resources")
      ]);

      let typesList = typesRes.data || [];
      let resourcesList = resourcesRes.data || [];

      // Apply filters
      if (typeFilter) {
        resourcesList = resourcesList.filter(r => r.typeId === parseInt(typeFilter));
      }
      if (statusFilter) {
        resourcesList = resourcesList.filter(r => r.status === statusFilter);
      }
      if (searchKeyword) {
        resourcesList = resourcesList.filter(r =>
          r.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          r.location.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }

      setResourceTypes(typesList);
      setResources(resourcesList);
      setError("");
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========== RESOURCE TYPE OPERATIONS ==========

  const handleAddTypeClick = () => {
    setTypeFormData({ typeId: null, typeName: "" });
    setShowTypeModal(true);
  };

  const handleEditTypeClick = (type) => {
    setTypeFormData({ typeId: type.typeId, typeName: type.typeName });
    setShowTypeModal(true);
  };

  const handleTypeFormSubmit = async (e) => {
    e.preventDefault();

    if (!typeFormData.typeName.trim()) {
      setError("Type name is required");
      return;
    }

    try {
      if (typeFormData.typeId) {
        // Update
        await API.put(`/resource-types/${typeFormData.typeId}`, {
          typeName: typeFormData.typeName,
        });
        setSuccess("Resource type updated successfully!");
      } else {
        // Create
        await API.post("/resource-types", {
          typeName: typeFormData.typeName,
        });
        setSuccess("Resource type created successfully!");
      }

      setShowTypeModal(false);
      setTypeFormData({ typeId: null, typeName: "" });
      fetchAllData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save resource type";
      setError(errorMsg);
    }
  };

  const handleDeleteTypeClick = (typeId) => {
    const typeInfo = resourceTypes.find(t => t.typeId === typeId);
    const count = resources.filter(r => r.typeId === typeId).length;
    setDeletingTypeId(typeId);
    setDeletingTypeResourceCount(count);
    setShowDeleteTypeModal(true);
  };

  const handleDeleteTypeConfirm = async () => {
    try {
      await API.delete(`/resource-types/${deletingTypeId}`);
      setSuccess(`Resource type and ${deletingTypeResourceCount} resource(s) deleted successfully!`);
      setShowDeleteTypeModal(false);
      setDeletingTypeId(null);
      fetchAllData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete resource type";
      setError(errorMsg);
    }
  };

  // ========== RESOURCE OPERATIONS ==========

  const handleAddResourceClick = () => {
    setEditingResourceId(null);
    setResourceFormData({
      resourceId: null,
      name: "",
      typeId: "",
      location: "",
      capacity: "",
      availabilityStart: "08:00",
      availabilityEnd: "18:00",
      status: "ACTIVE",
    });
    setShowResourceModal(true);
  };

  const handleEditResourceClick = (resource) => {
    setEditingResourceId(resource.resourceId);
    setResourceFormData({
      resourceId: resource.resourceId,
      name: resource.name,
      typeId: resource.typeId,
      location: resource.location,
      capacity: resource.capacity || "",
      availabilityStart: resource.availabilityStart || "08:00",
      availabilityEnd: resource.availabilityEnd || "18:00",
      status: resource.status,
    });
    setShowResourceModal(true);
  };

  const handleResourceFormSubmit = async (e) => {
    e.preventDefault();

    if (!resourceFormData.name.trim()) {
      setError("Resource name is required");
      return;
    }
    if (!resourceFormData.typeId) {
      setError("Resource type is required");
      return;
    }
    if (!resourceFormData.location.trim()) {
      setError("Location is required");
      return;
    }
    if (!resourceFormData.capacity || resourceFormData.capacity <= 0) {
      setError("Capacity must be greater than 0");
      return;
    }

    try {
      const payload = {
        name: resourceFormData.name,
        typeId: parseInt(resourceFormData.typeId),
        location: resourceFormData.location,
        capacity: parseInt(resourceFormData.capacity),
        availabilityStart: resourceFormData.availabilityStart,
        availabilityEnd: resourceFormData.availabilityEnd,
        status: resourceFormData.status,
      };

      if (editingResourceId) {
        // Update
        await API.put(`/resources/${editingResourceId}`, payload);
        setSuccess("Resource updated successfully!");
      } else {
        // Create
        await API.post("/resources", payload);
        setSuccess("Resource created successfully!");
      }

      setShowResourceModal(false);
      fetchAllData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save resource";
      setError(errorMsg);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await API.delete(`/resources/${resourceId}`);
      setSuccess("Resource deleted successfully!");
      fetchAllData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete resource";
      setError(errorMsg);
    }
  };

  const handleToggleStatus = async (resource) => {
    const newStatus = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      await API.patch(`/resources/${resource.resourceId}/status`, {
        status: newStatus,
      });
      setSuccess(`Resource status changed to ${newStatus}`);
      fetchAllData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update resource status";
      setError(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    return status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusBadgeColor = (status) => {
    return status === "ACTIVE" ? "bg-green-500" : "bg-red-500";
  };

  const getTypeNameById = (typeId) => {
    const type = resourceTypes.find(t => t.typeId === typeId);
    return type ? type.typeName : "Unknown";
  };

  const getResourceCountByType = (typeId) => {
    return resources.filter(r => r.typeId === typeId).length;
  };

  // Stats
  const stats = [
    {
      label: "Total Resources",
      value: resources.length,
      icon: "📦",
      color: "blue",
    },
    {
      label: "Resource Types",
      value: resourceTypes.length,
      icon: "🏷️",
      color: "purple",
    },
    {
      label: "Active",
      value: resources.filter(r => r.status === "ACTIVE").length,
      icon: "✅",
      color: "green",
    },
    {
      label: "Out of Service",
      value: resources.filter(r => r.status === "OUT_OF_SERVICE").length,
      icon: "⚠️",
      color: "red",
    },
  ];

  return (
    <Layout>
      {/* Minimalist Apple-Style Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Resources
        </h1>
        <p className="text-xl text-gray-500 mt-3 font-light">
          Manage all campus resources and facility types
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

      {/* STATS CARDS - Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => {
          const iconMap = {
            "📦": FiBox,
            "🏷️": FiFilter,
            "✅": FiCheck,
            "⚠️": FiAlertCircle,
          };
          const Icon = iconMap[stat.icon] || FiBox;
          
          const colorMap = {
            blue: "text-indigo-600 bg-indigo-50",
            purple: "text-purple-600 bg-purple-50",
            green: "text-emerald-600 bg-emerald-50",
            red: "text-red-600 bg-red-50",
          };

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

      {/* ===== RESOURCE TYPES SECTION ===== */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resource Types</h2>
          <button
            onClick={handleAddTypeClick}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Add Type
          </button>
        </div>

        {/* Resource Types Table - Professional Layout */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap w-20">Type ID</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap w-48">Type Name</th>
                <th className="px-4 py-4 text-center font-semibold text-gray-700 whitespace-nowrap w-40">Resources</th>
                <th className="px-4 py-4 text-center font-semibold text-gray-700 whitespace-nowrap w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resourceTypes.map((type) => (
                <tr key={type.typeId} className="border-b border-gray-200 hover:bg-blue-50 transition duration-150">
                  <td className="px-4 py-4 text-gray-700 font-mono font-medium w-20">{type.typeId}</td>
                  <td className="px-4 py-4 text-gray-900 font-medium w-48">{type.typeName}</td>
                  <td className="px-4 py-4 text-center w-40">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap">
                      {getResourceCountByType(type.typeId)} resources
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center w-24">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditTypeClick(type)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded transition"
                        title="Edit type"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTypeClick(type.typeId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                        title="Delete type"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {resourceTypes.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50">
              <FiFilter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No resource types available</p>
              <p className="text-sm">Click "Add Type" to create your first resource type</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== RESOURCES SECTION ===== */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
          <button
            onClick={handleAddResourceClick}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Add Resource
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Types</option>
            {resourceTypes.map((type) => (
              <option key={type.typeId} value={type.typeId}>
                {type.typeName}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
          <button
            onClick={() => {
              setSearchKeyword("");
              setTypeFilter("");
              setStatusFilter("");
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium px-4 py-2 rounded-lg transition"
          >
            Clear
          </button>
        </div>

        {/* Resources Table - Professional Layout */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">ID</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap w-40">Name</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap w-32">Type</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">Location</th>
                <th className="px-4 py-4 text-center font-semibold text-gray-700 whitespace-nowrap">Capacity</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">Hours</th>
                <th className="px-4 py-4 text-center font-semibold text-gray-700 whitespace-nowrap">Status</th>
                <th className="px-4 py-4 text-center font-semibold text-gray-700 whitespace-nowrap w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.resourceId} className="border-b border-gray-200 hover:bg-blue-50 transition duration-150">
                  <td className="px-4 py-4 text-gray-700 font-mono font-medium">{resource.resourceId}</td>
                  <td className="px-4 py-4 text-gray-900 font-medium truncate">{resource.name}</td>
                  <td className="px-4 py-4 text-gray-600">{getTypeNameById(resource.typeId) || "N/A"}</td>
                  <td className="px-4 py-4 text-gray-600">{resource.location || "N/A"}</td>
                  <td className="px-4 py-4 text-center text-gray-700 font-semibold">
                    {resource.capacity ? (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold inline-block">
                        {resource.capacity}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-xs whitespace-nowrap">
                    {resource.availabilityStart && resource.availabilityEnd
                      ? `${resource.availabilityStart.substring(0, 5)} - ${resource.availabilityEnd.substring(0, 5)}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(resource)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${getStatusColor(
                        resource.status
                      )}`}
                    >
                      {resource.status === "ACTIVE" ? "Active" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditResourceClick(resource)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded transition"
                        title="Edit resource"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource.resourceId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                        title="Delete resource"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {resources.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50">
              <FiBox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No resources found</p>
              <p className="text-sm">Try adjusting your filters or click "Add Resource" to create one</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== RESOURCE TYPE MODAL ===== */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {typeFormData.typeId ? "Edit Resource Type" : "Add Resource Type"}
            </h2>
            <form onSubmit={handleTypeFormSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type Name</label>
                <input
                  type="text"
                  value={typeFormData.typeName}
                  onChange={(e) =>
                    setTypeFormData({ ...typeFormData, typeName: e.target.value })
                  }
                  placeholder="e.g., Classroom, Lab, Conference Room"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition"
                >
                  {typeFormData.typeId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== RESOURCE MODAL ===== */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingResourceId ? "Edit Resource" : "Add Resource"}
            </h2>
            <form onSubmit={handleResourceFormSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resource Type *
                  </label>
                  <select
                    value={resourceFormData.typeId}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        typeId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a type</option>
                    {resourceTypes.map((type) => (
                      <option key={type.typeId} value={type.typeId}>
                        {type.typeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    value={resourceFormData.name}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Classroom 101"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={resourceFormData.location}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        location: e.target.value,
                      })
                    }
                    placeholder="e.g., Building A, 3rd Floor"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={resourceFormData.capacity}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        capacity: e.target.value,
                      })
                    }
                    placeholder="e.g., 50"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Availability Start
                  </label>
                  <input
                    type="time"
                    value={resourceFormData.availabilityStart}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        availabilityStart: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Availability End
                  </label>
                  <input
                    type="time"
                    value={resourceFormData.availabilityEnd}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        availabilityEnd: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={resourceFormData.status}
                  onChange={(e) =>
                    setResourceFormData({
                      ...resourceFormData,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition"
                >
                  {editingResourceId ? "Update Resource" : "Create Resource"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE TYPE CONFIRMATION MODAL ===== */}
      {showDeleteTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">Delete Type?</h2>
            <p className="text-gray-600 text-center mb-4">
              Are you sure you want to delete this resource type?
            </p>
            <p className="text-red-600 font-semibold mb-6 text-center text-sm">
              This will also delete {deletingTypeResourceCount} resource(s) under this type!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteTypeConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteTypeModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition"
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

export default ResourcesAdminPage;

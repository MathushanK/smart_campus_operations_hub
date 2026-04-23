import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import { FiSearch, FiFilter, FiBox, FiMapPin, FiUsers, FiClock, FiCheck } from "react-icons/fi";

function ResourceUserPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resource Types state
  const [resourceTypes, setResourceTypes] = useState([]);

  // Resources state - Only AVAILABLE resources
  const [resources, setResources] = useState([]);

  // Search & Filter state
  const [typeFilter, setTypeFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Load data on mount and when filters change
  useEffect(() => {
    fetchAllData();
  }, [typeFilter, searchKeyword]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [typesRes, resourcesRes] = await Promise.all([
        API.get("/resource-types"),
        API.get("/resources")
      ]);

      let typesList = typesRes.data || [];
      let resourcesList = resourcesRes.data || [];

      // Filter only AVAILABLE resources
      resourcesList = resourcesList.filter(r => r.status === "ACTIVE");

      // Apply type filter
      if (typeFilter) {
        resourcesList = resourcesList.filter(r => r.typeId === parseInt(typeFilter));
      }

      // Apply search filter
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
      setError("Failed to load resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeNameById = (typeId) => {
    const type = resourceTypes.find(t => t.typeId === typeId);
    return type ? type.typeName : "Unknown";
  };

  // Stats
  const stats = [
    {
      label: "Available Resources",
      value: resources.length,
      icon: FiBox,
      color: "emerald",
    },
    {
      label: "Resource Types",
      value: resourceTypes.length,
      icon: FiFilter,
      color: "purple",
    },
  ];

  return (
    <Layout>
      {/* Minimalist Apple-Style Header */}
      <div className="mb-12 mt-2">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Available Resources
        </h1>
        <p className="text-xl text-gray-500 mt-3 font-light">
          Browse and view all campus resources available for booking
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

      {/* STATS CARDS - Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          
          const colorMap = {
            emerald: "text-emerald-600 bg-emerald-50",
            purple: "text-purple-600 bg-purple-50",
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

      {/* RESOURCES SECTION */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse Resources</h2>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or location..."
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
          <button
            onClick={() => {
              setSearchKeyword("");
              setTypeFilter("");
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium px-4 py-2 rounded-lg transition"
          >
            Clear Filters
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
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold inline-block">
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
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && resources.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50">
              <FiBox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No resources available</p>
              <p className="text-sm">Try adjusting your filters to find resources</p>
            </div>
          )}
          {loading && (
            <div className="text-center py-12 text-gray-500 bg-gray-50">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
              <p className="font-semibold">Loading resources...</p>
            </div>
          )}
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="mt-8 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">About Available Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="text-2xl">📍</div>
            <div>
              <p className="font-semibold text-gray-900">Location</p>
              <p className="text-gray-600 text-sm">Each resource has a specific campus location for easy access</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">⏰</div>
            <div>
              <p className="font-semibold text-gray-900">Operating Hours</p>
              <p className="text-gray-600 text-sm">Resources are available during specified hours every day</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">👥</div>
            <div>
              <p className="font-semibold text-gray-900">Capacity</p>
              <p className="text-gray-600 text-sm">Maximum number of people or items the resource can accommodate</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ResourceUserPage;

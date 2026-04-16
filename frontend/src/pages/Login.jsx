import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OAUTH_LOGIN_URL } from "../config/runtime";
import { getDashboardPath } from "../utils/auth";

function Login() {

  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const errorMessage = new URLSearchParams(location.search).get("error");

  useEffect(() => {
    if (!loading && user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (errorMessage) {
      setOpen(true);
    }
  }, [errorMessage]);

  const handleLogin = () => {
    window.location.href = OAUTH_LOGIN_URL;
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">

      {/* 🔝 NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-4 bg-white shadow">

        <h1 className="text-2xl font-bold text-blue-700">
          CampusFlow
        </h1>

        <div className="hidden md:flex gap-6 text-gray-600">
          <span>Catalog</span>
          <span>Bookings</span>
          <span>Incident Hub</span>
          <span>Contact</span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700"
        >
          Portal Login
        </button>
      </nav>

      {/* 🚀 HERO */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">

        <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-6">
          Next-Gen Smart Campus Operations Hub
        </span>

        <h1 className="text-5xl font-bold mb-6">
          Efficiency in Every{" "}
          <span className="text-blue-400">Campus Resource</span>
        </h1>

        <p className="text-gray-600 max-w-2xl mb-8">
          Manage facilities, bookings, and incidents with ease.
        </p>

        <div className="flex gap-4">

          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
          >
            Get Started →
          </button>

          <button className="border px-6 py-3 rounded-lg">
            View Facility Catalog
          </button>

        </div>
      </div>

      {/* 🔥 MODAL LOGIN */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-3 text-gray-500"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">
              Welcome back
            </h2>

            <p className="text-gray-500 mb-4">
              Sign in with your campus Google account.
            </p>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 text-left">
              
              <div className="space-y-2 text-sm text-blue-800">
                {/* Email */}
            <input
              type="email"
              placeholder="your.email@campus.edu"
              className="w-full border p-2 rounded-lg mb-3"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded-lg mb-4"
            />
            {/* Sign in */}
            <button className="w-full bg-blue-700 text-white py-2 rounded-lg">
              Sign In
            </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full border py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
              disabled={loading}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5"
              />
              {loading ? "Checking session..." : "Continue with Google"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Login;

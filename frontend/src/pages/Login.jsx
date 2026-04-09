import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = () => {
    window.location.href = "http://localhost:8080/api/v1/oauth2/authorization/google";
  };

  const handleSignIn = () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const newUser = { id: Date.now(), email, role };
    setUser(newUser);
    setOpen(false);
    navigate("/user/dashboard");
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

          <div className="bg-white w-100 p-6 rounded-xl shadow-lg relative">

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
              Sign in to access your campus dashboard
            </p>

            {/* Role Tabs (UI only) */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">

              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 py-2 rounded-lg transition ${role === "user" ? "bg-white shadow text-blue-700" : "text-gray-600 hover:text-blue-700"}`}
              >
                User
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2 rounded-lg transition ${role === "admin" ? "bg-white shadow text-blue-700" : "text-gray-600 hover:text-blue-700"}`}
              >
                Admin
              </button>

              <button
                type="button"
                onClick={() => setRole("technician")}
                className={`flex-1 py-2 rounded-lg transition ${role === "technician" ? "bg-white shadow text-blue-700" : "text-gray-600 hover:text-blue-700"}`}
              >
                Technician
              </button>

            </div>

            {/* Google Login */}
            <button
              onClick={handleLogin}
              className="w-full border py-2 rounded-lg flex items-center justify-center gap-2 mb-4 hover:bg-gray-50"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="text-center text-gray-400 text-sm mb-4">
              OR CONTINUE WITH EMAIL
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="your.email@campus.edu"
              className="w-full border p-2 rounded-lg mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded-lg mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Sign in */}
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full bg-blue-700 text-white py-2 rounded-lg"
            >
              Sign In
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Login;
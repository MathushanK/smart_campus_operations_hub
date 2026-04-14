import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashbord.jsx";
import UserDashboard from "../pages/UserDashboard.jsx";
import TechnicianDashboard from "../pages/TechnicianDashboard.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/technician/dashboard" element={<ProtectedRoute><TechnicianDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;
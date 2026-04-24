import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashbord.jsx";
import UserDashboard from "../pages/UserDashboard.jsx";
import TechnicianDashboard from "../pages/TechnicianDashboard.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import BookingUserPage from "../pages/BookingUserPage.jsx";
import BookingAdminPage from "../pages/BookingAdminPage.jsx";
import ResourcesAdminPage from "../pages/ResourcesAdminPage.jsx";
import ResourceUserPage from "../pages/ResourceUserPage.jsx";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/auth";
import TicketList from "../pages/TicketList";
import CreateTicket from "../pages/CreateTicket";
import TicketDetails from "../pages/TicketDetails";
import AdminTicketManagement from "../pages/AdminTicketManagement.jsx";

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDashboardPath(user?.role)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
      <Route path="/technician/dashboard" element={<ProtectedRoute allowedRoles={["technician"]}><TechnicianDashboard /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
      <Route path="/tickets/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
      <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>} />
      <Route path="/user/bookings" element={<ProtectedRoute allowedRoles={["user"]}><BookingUserPage /></ProtectedRoute>} />
      <Route path="/user/resources" element={<ProtectedRoute allowedRoles={["user"]}><ResourceUserPage /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={["admin"]}><BookingAdminPage /></ProtectedRoute>} />
      <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTicketManagement /></ProtectedRoute>}/>
      <Route path="/admin/resources" element={<ProtectedRoute allowedRoles={["admin"]}><ResourcesAdminPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;

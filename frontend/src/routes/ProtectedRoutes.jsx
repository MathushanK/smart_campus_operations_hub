import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath, hasAllowedRole } from "../utils/auth";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/" />;

  if (!hasAllowedRole(user, allowedRoles)) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;

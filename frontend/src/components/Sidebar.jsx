import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">

      <h2 className="text-2xl font-bold mb-6">Smart Campus</h2>

      <nav className="flex flex-col gap-3">

        <Link to="/user/dashboard" className="hover:bg-gray-700 p-2 rounded">
          Dashboard
        </Link>

        {user?.authorities?.includes("ROLE_ADMIN") && (
          <Link to="/admin/dashboard" className="hover:bg-gray-700 p-2 rounded">
            Admin Panel
          </Link>
        )}

        {user?.authorities?.includes("ROLE_TECHNICIAN") && (
          <Link to="/technician/dashboard" className="hover:bg-gray-700 p-2 rounded">
            Technician Panel
          </Link>
        )}

      </nav>
    </div>
  );
}

export default Sidebar;
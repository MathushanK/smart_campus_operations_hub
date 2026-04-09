import { useAuth } from "../context/AuthContext";

function Navbar() {

  const { user } = useAuth();

  const logout = () => {
    window.location.href = "http://localhost:8080/api/v1/logout";
  };

  return (
    <div className="flex justify-between items-center bg-white shadow p-4">

      <h3 className="text-lg font-semibold">
        Welcome, {user?.name}
      </h3>

      <div className="flex items-center gap-4">

        <span className="text-xl cursor-pointer">🔔</span>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;
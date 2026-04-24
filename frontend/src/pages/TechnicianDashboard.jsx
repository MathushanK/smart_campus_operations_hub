import Layout from "../components/Layout";
import { useEffect, useState } from "react";

function TechnicianDashboard() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep overview lightweight; ticket queue lives in "My Assigned Tickets"
    setLoading(false);
  }, []);

  return (
    <Layout>

      <div className="bg-orange-500 text-white p-6 rounded-xl mb-6 shadow">
        <h1 className="text-3xl font-bold">Technician Dashboard 🔧</h1>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border p-6">
          <p className="text-gray-700">
            Use the <span className="font-semibold">My Assigned Tickets</span> tab to view and manage your assigned work.
          </p>
        </div>
      )}

    </Layout>
  );
}

export default TechnicianDashboard;
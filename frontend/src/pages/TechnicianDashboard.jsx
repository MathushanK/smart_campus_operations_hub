import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import API from "../api/api";

function TechnicianDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all tickets (technician view)
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await API.get("/tickets"); // 🔥 make sure backend supports this
        setTickets(res.data || []);
      } catch (err) {
        console.error("Error fetching tickets", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // ✅ Update ticket status
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tickets/${id}/status`, { status });

      setTickets(prev =>
        prev.map(t =>
          t.id === id ? { ...t, status } : t
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // ✅ Stats
  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const progressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;

  return (
    <Layout>

      {/* HEADER */}
      <div className="bg-linear-to-r from-orange-600 to-orange-400 rounded-2xl p-8 mb-8 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2">Technician Dashboard 🔧</h1>
        <p className="text-orange-100">
          Manage and resolve campus incident tickets efficiently.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <h2 className="text-sm text-gray-600">Open Tickets</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">{openCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
          <h2 className="text-sm text-gray-600">In Progress</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{progressCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <h2 className="text-sm text-gray-600">Resolved</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{resolvedCount}</p>
        </div>

      </div>

      {/* TICKET LIST */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        <div className="bg-orange-500 px-6 py-4">
          <h2 className="text-white text-xl font-bold">🎫 Ticket Management</h2>
        </div>

        <div className="p-6">

          {loading ? (
            <p className="text-center text-gray-500">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-center text-gray-500">No tickets found</p>
          ) : (
            <div className="space-y-4">

              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="border p-4 rounded-lg shadow-sm bg-gray-50"
                >
                  <div className="flex justify-between items-center">

                    <div>
                      <h3 className="font-bold text-lg">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {ticket.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Status: {ticket.status}
                      </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">

                      <button
                        onClick={() => updateStatus(ticket.id, "IN_PROGRESS")}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                      >
                        Start
                      </button>

                      <button
                        onClick={() => updateStatus(ticket.id, "RESOLVED")}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Resolve
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      </div>

    </Layout>
  );
}

export default TechnicianDashboard;
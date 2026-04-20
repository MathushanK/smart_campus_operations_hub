import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { getAllTickets, updateTicketStatus } from "../api/ticketApi";

function TechnicianDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ BEST PRACTICE: define inside useEffect
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await getAllTickets();
        setTickets(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // ✅ Update status + refresh UI
  const updateStatus = async (id, status) => {
    try {
      await updateTicketStatus(id, status);

      // update UI without full reload (better UX)
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
      <div className="bg-orange-500 text-white p-6 rounded-xl mb-6 shadow">
        <h1 className="text-3xl font-bold">Technician Dashboard 🔧</h1>
        <p className="text-sm text-orange-100 mt-1">
          Manage and resolve support tickets
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 shadow rounded border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Open</p>
          <h2 className="text-2xl font-bold text-red-600">{openCount}</h2>
        </div>

        <div className="bg-white p-4 shadow rounded border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">In Progress</p>
          <h2 className="text-2xl font-bold text-yellow-600">{progressCount}</h2>
        </div>

        <div className="bg-white p-4 shadow rounded border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Resolved</p>
          <h2 className="text-2xl font-bold text-green-600">{resolvedCount}</h2>
        </div>

      </div>

      {/* TICKET LIST */}
      {loading ? (
        <p className="text-center text-gray-500">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500">No tickets found</p>
      ) : (
        <div className="space-y-4">

          {tickets.map(t => (
            <div
              key={t.id}
              className="p-5 border rounded-xl bg-gray-50 shadow-sm"
            >

              {/* TITLE + CATEGORY */}
              <h3 className="font-bold text-lg">{t.title}</h3>
              <p className="text-sm text-gray-500">{t.category}</p>

              {/* DESCRIPTION */}
              <p className="mt-2 text-gray-700">{t.description}</p>

              {/* STATUS */}
              <p className="mt-2 text-sm">
                Status:{" "}
                <span className={`font-semibold
                  ${t.status === "OPEN" ? "text-red-600" : ""}
                  ${t.status === "IN_PROGRESS" ? "text-yellow-600" : ""}
                  ${t.status === "RESOLVED" ? "text-green-600" : ""}
                `}>
                  {t.status}
                </span>
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => updateStatus(t.id, "IN_PROGRESS")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                >
                  Start
                </button>

                <button
                  onClick={() => updateStatus(t.id, "RESOLVED")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                >
                  Resolve
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </Layout>
  );
}

export default TechnicianDashboard;
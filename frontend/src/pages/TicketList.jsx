import { useEffect, useMemo, useState } from "react";
import { getAssignedTickets, getMyTickets } from "../api/ticketApi";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TicketCard from "../components/TicketCard";
import { useAuth } from "../context/AuthContext";

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res =
          user?.role === "technician"
            ? await getAssignedTickets()
            : await getMyTickets();
        setTickets(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user?.role]);

  const counts = useMemo(() => {
    const result = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      rejected: 0,
    };

    for (const t of tickets) {
      if (t.status === "OPEN") result.open += 1;
      if (t.status === "IN_PROGRESS") result.inProgress += 1;
      if (t.status === "RESOLVED") result.resolved += 1;
      if (t.status === "CLOSED") result.closed += 1;
      if (t.status === "REJECTED") result.rejected += 1;
    }

    return result;
  }, [tickets]);

  const canCreate = user?.role === "user";

  const filteredTickets = tickets
    .filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter))
    .filter((t) => {
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        String(t.id).includes(needle) ||
        (t.title || "").toLowerCase().includes(needle) ||
        (t.description || "").toLowerCase().includes(needle) ||
        (t.category || "").toLowerCase().includes(needle)
      );
    });

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          🎫 {user?.role === "technician" ? "My Assigned Tickets" : "My Tickets"}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tickets..."
            className="border rounded-lg px-3 py-2 w-full sm:w-64 bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          {canCreate && (
            <button
              onClick={() => navigate("/tickets/create")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Create Ticket
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Open</p>
          <p className="text-2xl font-bold">{counts.open}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">In progress</p>
          <p className="text-2xl font-bold">{counts.inProgress}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Resolved</p>
          <p className="text-2xl font-bold">{counts.resolved}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Closed</p>
          <p className="text-2xl font-bold">{counts.closed}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Rejected</p>
          <p className="text-2xl font-bold">{counts.rejected}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          Loading tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-500 mb-4">No tickets yet</p>

          {canCreate && (
            <button
              onClick={() => navigate("/tickets/create")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Create Your First Ticket
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </Layout>
  );
}

export default TicketList;
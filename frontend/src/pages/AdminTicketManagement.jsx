import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getAllTickets, getTechnicians } from "../api/ticketApi";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function AdminTicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message: string }
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [rejectModal, setRejectModal] = useState({ open: false, ticketId: null, reason: "" });
  const [selectedTech, setSelectedTech] = useState({}); // { [ticketId]: technicianId }
  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getAllTickets();
      setTickets(res.data || []);
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    getTechnicians()
      .then((res) => setTechnicians(res.data || []))
      .catch((err) => console.error("Failed to load technicians:", err));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const approveTicket = async (id) => {
    try {
      setBusyId(id);
      // "Approve" = accept ticket (move out of OPEN backlog). You can change the target status later.
      await API.put(`/tickets/${id}/admin-status?status=IN_PROGRESS`);

      // optimistic UI update (instant)
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "IN_PROGRESS", rejectionReason: null } : t))
      );

      setToast({ type: "success", message: "Ticket approved" });
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Approve failed" });
    } finally {
      setBusyId(null);
      // sync with server (in case sorting/filters)
      loadTickets();
    }
  };

  const openReject = (ticketId) => {
    setRejectModal({ open: true, ticketId, reason: "" });
  };

  const confirmReject = async () => {
    const id = rejectModal.ticketId;
    const reason = rejectModal.reason.trim();
    if (!id || !reason) return;

    try {
      setBusyId(id);
      await API.put(
        `/tickets/${id}/admin-status?status=REJECTED&reason=${encodeURIComponent(reason)}`
      );

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "REJECTED", rejectionReason: reason } : t))
      );

      setToast({ type: "success", message: "Ticket rejected" });
      setRejectModal({ open: false, ticketId: null, reason: "" });
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Reject failed" });
    } finally {
      setBusyId(null);
      loadTickets();
    }
  };

  const assignTechnician = async (ticketId, technicianId) => {
    if (!technicianId) return;
    try {
      setBusyId(ticketId);
      await API.post(`/tickets/${ticketId}/assign?technicianId=${technicianId}`);
      const tech = technicians.find((t) => String(t.id) === String(technicianId));
      setToast({
        type: "success",
        message: `Assigned to ${tech?.name || "technician"}`,
      });
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Assign failed" });
    } finally {
      setBusyId(null);
      loadTickets();
    }
  };

  const filteredTickets = tickets
    .filter((t) => (filter === "ALL" ? true : t.status === filter))
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

  const statusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    if (status === "OPEN") return `${base} bg-blue-100 text-blue-700`;
    if (status === "IN_PROGRESS") return `${base} bg-yellow-100 text-yellow-800`;
    if (status === "RESOLVED") return `${base} bg-green-100 text-green-700`;
    if (status === "CLOSED") return `${base} bg-gray-200 text-gray-800`;
    if (status === "REJECTED") return `${base} bg-red-100 text-red-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
                toast.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Ticket Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Review tickets, approve/reject with reason, and assign technicians.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by id/title/category..."
                className="border rounded-lg px-3 py-2 w-full sm:w-72"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="ALL">All statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <button
                onClick={loadTickets}
                className="border rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6">
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold">{counts.total}</p>
            </div>
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-xs text-gray-500">Open</p>
              <p className="text-2xl font-bold">{counts.open}</p>
            </div>
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-xs text-gray-500">In progress</p>
              <p className="text-2xl font-bold">{counts.inProgress}</p>
            </div>
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-xs text-gray-500">Resolved</p>
              <p className="text-2xl font-bold">{counts.resolved}</p>
            </div>
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-xs text-gray-500">Closed</p>
              <p className="text-2xl font-bold">{counts.closed}</p>
            </div>
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-xs text-gray-500">Rejected</p>
              <p className="text-2xl font-bold">{counts.rejected}</p>
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : filteredTickets.length === 0 ? (
              <p className="text-gray-500">No tickets found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-3 pr-4">Ticket</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Priority</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Reject reason</th>
                      <th className="py-3 pr-4">Assign</th>
                      <th className="py-3 pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t) => {
                      const busy = busyId === t.id;
                      const canReview = t.status === "OPEN";
                      const chosenTech = selectedTech[t.id] || "";
                      return (
                        <tr key={t.id} className="border-b last:border-b-0">
                          <td className="py-4 pr-4 align-top">
                            <p className="font-semibold text-gray-900">
                              #{t.id} {t.title}
                            </p>
                            <p className="text-gray-600 line-clamp-2">
                              {t.description}
                            </p>
                          </td>
                          <td className="py-4 pr-4 align-top">{t.category}</td>
                          <td className="py-4 pr-4 align-top">{t.priority}</td>
                          <td className="py-4 pr-4 align-top">
                            <span className={statusBadge(t.status)}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 pr-4 align-top">
                            {t.rejectionReason ? (
                              <span className="text-red-700">{t.rejectionReason}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-4 pr-4 align-top">
                            <select
                              className="border rounded-lg px-2 py-2 w-56"
                              value={chosenTech}
                              onChange={(e) =>
                                setSelectedTech((prev) => ({ ...prev, [t.id]: e.target.value }))
                              }
                              disabled={busy}
                            >
                              <option value="" disabled>
                                Select technician
                              </option>
                              {technicians.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.email})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 pr-0 align-top">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => navigate(`/tickets/${t.id}`)}
                                disabled={busy}
                                className={`px-3 py-2 rounded-lg border ${
                                  busy ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
                                }`}
                              >
                                View
                              </button>
                              <button
                                onClick={() => approveTicket(t.id)}
                                disabled={!canReview || busy}
                                className={`px-3 py-2 rounded-lg text-white ${
                                  !canReview || busy
                                    ? "bg-green-300 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openReject(t.id)}
                                disabled={!canReview || busy}
                                className={`px-3 py-2 rounded-lg text-white ${
                                  !canReview || busy
                                    ? "bg-red-300 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => assignTechnician(t.id, chosenTech)}
                                disabled={busy || !chosenTech}
                                className={`px-3 py-2 rounded-lg text-white ${
                                  busy || !chosenTech
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                              >
                                Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reject modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900">Reject ticket</h2>
              <p className="text-sm text-gray-600 mt-1">
                Provide a reason (required).
              </p>

              <textarea
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((p) => ({ ...p, reason: e.target.value }))
                }
                className="mt-4 w-full border rounded-lg p-3 h-28"
                placeholder="Reason for rejection..."
              />

              <div className="mt-5 flex gap-3 justify-end">
                <button
                  onClick={() => setRejectModal({ open: false, ticketId: null, reason: "" })}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectModal.reason.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    rejectModal.reason.trim()
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminTicketManagement;


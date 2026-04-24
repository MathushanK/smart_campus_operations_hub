import { useEffect, useState } from "react";
import {
  getTicketById,
  updateTicketStatus,
  getTicketImages,
  getTicketAssignment,
  getTicketComments,
  addTicketComment,
  updateTicketComment,
  deleteTicketComment
} from "../api/ticketApi";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext"; // ⭐ IMPORTANT

function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth(); // ⭐ GET ROLE

  const [ticket, setTicket] = useState(null);
  const [images, setImages] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetchTicket();
    fetchImages();
    fetchAssignment();
    fetchComments();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      console.error("Ticket fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await getTicketImages(id);
      setImages(res.data || []);
    } catch (err) {
      console.warn("Image fetch failed:", err);
      setImgError(true);
    }
  };

  const fetchAssignment = async () => {
    try {
      const res = await getTicketAssignment(id);
      const data = res.data && Object.keys(res.data).length ? res.data : null;
      setAssignment(data);
    } catch (err) {
      console.warn("Assignment fetch failed:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await getTicketComments(id);
      setComments(res.data || []);
    } catch (err) {
      console.warn("Comment fetch failed:", err);
    }
  };

  const handleAddComment = async () => {
    const text = newComment.trim();
    if (!text) return;
    await addTicketComment(id, text);
    setNewComment("");
    fetchComments();
  };

  const handleEditComment = async (commentId, currentText) => {
    const next = prompt("Edit comment:", currentText);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    await updateTicketComment(commentId, trimmed);
    fetchComments();
  };

  const handleDeleteComment = async (commentId) => {
    const ok = window.confirm("Delete this comment?");
    if (!ok) return;
    await deleteTicketComment(commentId);
    fetchComments();
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  // ✅ Technician resolves
  const handleResolve = async () => {
    await updateTicketStatus(id, "RESOLVED");
    fetchTicket();
  };

  // ✅ User confirms
  const handleConfirm = async () => {
    await updateTicketStatus(id, "CLOSED");
    fetchTicket();
  };

  // ✅ User reopens
  const handleReopen = async () => {
    await updateTicketStatus(id, "OPEN");
    fetchTicket();
  };

  if (loading) return <p className="text-center mt-10">Loading ticket...</p>;

  if (!ticket) {
    return (
      <Layout>
        <p className="text-center text-red-500 mt-10">
          Failed to load ticket.
        </p>
      </Layout>
    );
  }

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
      <div className="max-w-3xl mx-auto bg-white p-5 sm:p-6 rounded-2xl shadow border">

        {/* TITLE */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              #{ticket.id} {ticket.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{ticket.category}</p>
          </div>
          <span className={statusBadge(ticket.status)}>{ticket.status}</span>
        </div>

        {/* DESCRIPTION */}
        <p className="mt-4 text-gray-700">
          {ticket.description}
        </p>

        {/* META */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 border rounded-xl p-3">
            <p className="text-xs text-gray-500">Priority</p>
            <p className="font-semibold text-gray-900">{ticket.priority}</p>
          </div>
          <div className="bg-gray-50 border rounded-xl p-3">
            <p className="text-xs text-gray-500">Contact</p>
            <p className="font-semibold text-gray-900">
              {ticket.contactDetails || "—"}
            </p>
          </div>
        </div>

        {/* REJECTED */}
        {ticket.status === "REJECTED" && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
            <p className="font-semibold">Rejected</p>
            <p className="text-sm mt-1">
              {ticket.rejectionReason || "No rejection reason provided."}
            </p>
          </div>
        )}

        {/* ASSIGNMENT / NOTES */}
        {(assignment || ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
          <div className="mt-6 bg-white border rounded-xl p-4">
            <h2 className="font-semibold text-lg">Assignment</h2>
            {assignment ? (
              <div className="mt-2 text-sm text-gray-700 space-y-2">
                <p>
                  <span className="text-gray-500">Technician:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {assignment.technicianName || assignment.technicianEmail || `User #${assignment.technicianId}`}
                  </span>
                </p>
                {assignment.assignedAt && (
                  <p className="text-xs text-gray-500">
                    Assigned at: {formatDateTime(assignment.assignedAt)}
                  </p>
                )}
                <div>
                  <p className="text-gray-500 text-xs">Resolution notes</p>
                  <p className="text-gray-900">
                    {assignment.resolutionNotes || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Not assigned yet.</p>
            )}
          </div>
        )}

        {/* ⭐ IMAGES */}
        <div className="mt-6">
          <h2 className="font-semibold mb-3 text-lg">
            📷 Attached Images
          </h2>

          {images.length === 0 && !imgError && (
            <p className="text-gray-500 text-sm">
              No images uploaded.
            </p>
          )}

          {imgError && (
            <p className="text-red-500 text-sm">
              Failed to load images.
            </p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt="ticket"
                  className="w-full h-32 object-cover rounded-lg border hover:scale-105 transition"
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= ACTION BUTTONS ================= */}

        <div className="mt-6 flex gap-3 flex-wrap">

          {/* 🛠 Technician actions */}
          {user?.role === "technician" && ticket.status === "OPEN" && (
            <button
              onClick={() => updateTicketStatus(id, "IN_PROGRESS")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              Start Work
            </button>
          )}

          {user?.role === "technician" && ticket.status === "IN_PROGRESS" && (
            <button
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Mark as Resolved
            </button>
          )}

          {/* 👤 User actions */}
          {user?.role === "user" && ticket.status === "RESOLVED" && (
            <>
              <button
                onClick={handleConfirm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Confirm Resolution
              </button>

              <button
                onClick={handleReopen}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Not Fixed (Reopen)
              </button>
            </>
          )}

        </div>

        {/* ================= COMMENTS ================= */}
        <div className="mt-8">
          <h2 className="font-semibold mb-3 text-lg">Comments</h2>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Post
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            ) : (
              comments.map((c) => {
                const canModify =
                  user?.role === "admin" || String(c.userId) === String(user?.id);

                return (
                  <div key={c.id} className="border rounded p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {c.userName || c.userEmail || `User #${c.userId ?? "?"}`}
                        </p>
                        {c.createdAt && (
                          <p className="text-xs text-gray-500">
                            {formatDateTime(c.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800">{c.comment}</p>
                    <div className="mt-2 flex gap-2">
                      {canModify && (
                        <>
                          <button
                            onClick={() => handleEditComment(c.id, c.comment)}
                            className="text-sm px-3 py-1 rounded border"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-sm px-3 py-1 rounded border border-red-300 text-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default TicketDetails;
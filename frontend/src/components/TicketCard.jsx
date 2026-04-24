import { useNavigate } from "react-router-dom";

function TicketCard({ ticket }) {
  const navigate = useNavigate();

  const statusClass = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    if (status === "OPEN") return `${base} bg-blue-100 text-blue-700`;
    if (status === "IN_PROGRESS") return `${base} bg-yellow-100 text-yellow-800`;
    if (status === "RESOLVED") return `${base} bg-green-100 text-green-700`;
    if (status === "CLOSED") return `${base} bg-gray-200 text-gray-800`;
    if (status === "REJECTED") return `${base} bg-red-100 text-red-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="p-5 bg-white border rounded-xl cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 truncate">
            #{ticket.id} {ticket.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {ticket.description}
          </p>
        </div>
        <span className={statusClass(ticket.status)}>{ticket.status}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        {ticket.category && <span>Category: {ticket.category}</span>}
        {ticket.priority && <span>Priority: {ticket.priority}</span>}
      </div>
    </div>
  );
}

export default TicketCard;
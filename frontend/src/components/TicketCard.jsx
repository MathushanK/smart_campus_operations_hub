import { useNavigate } from "react-router-dom";

function TicketCard({ ticket }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="p-4 border rounded-lg cursor-pointer hover:shadow"
    >
      <h3 className="font-bold">{ticket.title}</h3>
      <p className="text-sm text-gray-600">{ticket.description}</p>

      <span className="text-xs text-blue-600">
        Status: {ticket.status}
      </span>
    </div>
  );
}

export default TicketCard;
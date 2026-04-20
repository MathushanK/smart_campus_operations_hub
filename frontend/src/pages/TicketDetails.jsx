import { useEffect, useState } from "react";
import { getTicketById, updateTicket } from "../api/ticketApi";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";

function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, []);

  const fetchTicket = async () => {
    const res = await getTicketById(id);
    setTicket(res.data);
  };

  const handleUpdate = async () => {
    await updateTicket(id, { status: "RESOLVED" });
    fetchTicket();
  };

  if (!ticket) return <p>Loading...</p>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold">{ticket.title}</h1>

      <p className="mt-4">{ticket.description}</p>

      <p className="mt-2 text-blue-600">
        Status: {ticket.status}
      </p>

      <button
        onClick={handleUpdate}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Mark as Resolved
      </button>
    </Layout>
  );
}

export default TicketDetails;
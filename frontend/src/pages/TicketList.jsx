import { useEffect, useState } from "react";
import { getMyTickets } from "../api/ticketApi";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TicketCard from "../components/TicketCard";

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">🎫 My Tickets</h1>

        <button
          onClick={() => navigate("/tickets/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-500 mb-4">No tickets yet</p>

          <button
            onClick={() => navigate("/tickets/create")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </Layout>
  );
}

export default TicketList;
import { useEffect, useState } from "react";
import {
  getTicketById,
  updateTicketStatus,
  getTicketImages
} from "../api/ticketApi";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";

function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetchTicket();
    fetchImages();
  }, [id]);

  // ✅ Fetch ticket ONLY
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

  // ✅ Fetch images safely
  const fetchImages = async () => {
    try {
      const res = await getTicketImages(id);
      setImages(res.data || []);
    } catch (err) {
      console.warn("Image fetch failed (non-critical):", err);
      setImgError(true); // don’t crash UI
    }
  };

  const handleUpdate = async () => {
    try {
      await updateTicketStatus(id, "RESOLVED");
      fetchTicket();
    } catch (err) {
      console.error("Status update failed:", err);
    }
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

  return (
    <Layout>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

        {/* TITLE */}
        <h1 className="text-2xl font-bold">{ticket.title}</h1>

        {/* CATEGORY */}
        <p className="text-sm text-gray-500 mt-1">
          {ticket.category}
        </p>

        {/* DESCRIPTION */}
        <p className="mt-4 text-gray-700">
          {ticket.description}
        </p>

        {/* META */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="text-blue-600 font-medium">
            Priority: {ticket.priority}
          </span>

          <span className="text-green-600 font-medium">
            Status: {ticket.status}
          </span>
        </div>

        {/* ⭐ IMAGE SECTION */}
        <div className="mt-6">

          <h2 className="font-semibold mb-3 text-lg">
            📷 Attached Images
          </h2>

          {/* No images */}
          {images.length === 0 && !imgError && (
            <p className="text-gray-500 text-sm">
              No images uploaded for this ticket.
            </p>
          )}

          {/* API failed */}
          {imgError && (
            <p className="text-red-500 text-sm">
              Failed to load images.
            </p>
          )}

          {/* Images grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

        {/* ACTION */}
        <button
          onClick={handleUpdate}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Mark as Resolved
        </button>

      </div>

    </Layout>
  );
}

export default TicketDetails;
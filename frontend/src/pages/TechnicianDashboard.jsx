import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import {
  getAllTickets,
  updateTicketStatus,
  getTicketImages
} from "../api/ticketApi";

function TechnicianDashboard() {
  const [tickets, setTickets] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await getAllTickets();
      const ticketList = res.data || [];
      setTickets(ticketList);

      // fetch images for each ticket
      const imageData = {};
      for (let t of ticketList) {
        const imgRes = await getTicketImages(t.id);
        imageData[t.id] = imgRes.data;
      }
      setImagesMap(imageData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateTicketStatus(id, status);

      setTickets(prev =>
        prev.map(t =>
          t.id === id ? { ...t, status } : t
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>

      <div className="bg-orange-500 text-white p-6 rounded-xl mb-6 shadow">
        <h1 className="text-3xl font-bold">Technician Dashboard 🔧</h1>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="space-y-4">

          {tickets.map(t => (
            <div key={t.id} className="p-5 border rounded-xl bg-gray-50 shadow-sm">

              <h3 className="font-bold text-lg">{t.title}</h3>
              <p className="text-sm text-gray-500">{t.category}</p>

              <p className="mt-2">{t.description}</p>

              <p className="mt-2">
                Status: <strong>{t.status}</strong>
              </p>

              {/* ⭐ SHOW IMAGES */}
              {imagesMap[t.id]?.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {imagesMap[t.id].map(img => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt="ticket"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => updateStatus(t.id, "IN_PROGRESS")}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Start
                </button>

                <button
                  onClick={() => updateStatus(t.id, "RESOLVED")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
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
import { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

function UserDashboard() {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get("/notifications")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.notifications || [];
        setNotifications(data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      <div className="bg-white p-5 rounded shadow">

        <h3 className="text-lg font-semibold mb-3">Notifications</h3>

        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="border-b py-2">
              {n.message}
            </div>
          ))
        )}

      </div>

    </Layout>
  );
}

export default UserDashboard;
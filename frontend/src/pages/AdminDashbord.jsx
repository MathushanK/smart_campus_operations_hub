import Layout from "../components/Layout";

function AdminDashboard() {
  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-3xl mt-2">120</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-3xl mt-2">45</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-lg font-semibold">Tickets</h2>
          <p className="text-3xl mt-2">12</p>
        </div>

      </div>

    </Layout>
  );
}

export default AdminDashboard;
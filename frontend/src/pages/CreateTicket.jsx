import { useState } from "react";
import { createTicket } from "../api/ticketApi";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function CreateTicket() {

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    priority: "LOW",
    contactDetails: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await createTicket(form);

      setMessage("✅ Ticket submitted successfully!");

      // Redirect after short delay
      setTimeout(() => {
        navigate("/tickets");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("❌ Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          🎫 Create Ticket
        </h1>

        {/* ✅ SUCCESS MESSAGE */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
            {message}
          </div>
        )}

        {/* ❌ ERROR MESSAGE */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Issue Title
            </label>
            <input
              name="title"
              placeholder="e.g. WiFi not working"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Category
            </label>
            <select
              name="category"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="IT Issue">IT Issue</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your issue in detail..."
              className="w-full border p-3 rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
              required
            />
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Priority
            </label>
            <select
              name="priority"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* CONTACT */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Contact Details
            </label>
            <input
              name="contactDetails"
              placeholder="Phone or email"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>

        </form>
      </div>

    </Layout>
  );
}

export default CreateTicket;
import { useState } from "react";
import { createTicket, uploadTicketImage } from "../api/ticketApi";
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

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ LIMIT CHECK
    if (images.length > 3) {
      setError("❌ Maximum 3 images allowed");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create ticket
      const res = await createTicket(form);
      const ticketId = res.data.id;

      // 2. Upload images
      for (let i = 0; i < images.length; i++) {
        await uploadTicketImage(ticketId, images[i]);
      }

      setMessage("✅ Ticket submitted successfully!");

      setTimeout(() => {
        navigate("/tickets");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("❌ Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          🎫 Create Ticket
        </h1>

        {/* Messages */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Issue Title
            </label>
            <input
              name="title"
              placeholder="e.g. WiFi not working"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your issue clearly..."
              className="w-full border p-3 rounded h-32 resize-none focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={handleChange}
              required
            />
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={handleChange}
            >
              <option value="LOW">Low (minor issue)</option>
              <option value="MEDIUM">Medium (needs attention)</option>
              <option value="HIGH">High (urgent issue)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Select HIGH only for urgent issues
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Contact Details
            </label>
            <input
              name="contactDetails"
              placeholder="Phone number or email"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Attach Images (Max 3)
            </label>

            <div className="border-2 border-dashed border-gray-300 p-5 rounded-lg text-center hover:border-blue-400 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="fileUpload"
              />

              <label htmlFor="fileUpload" className="cursor-pointer text-blue-600 font-medium">
                Click to upload images
              </label>

              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG allowed (max 3 files)
              </p>
            </div>

            {images.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {images.length} file(s) selected
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition
              ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
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
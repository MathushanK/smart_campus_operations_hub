import { useState } from "react";
import { createTicket } from "../api/ticketApi";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function CreateTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTicket({ title, description });
      navigate("/tickets");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Create Ticket</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        <input
          type="text"
          placeholder="Title"
          className="w-full border p-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          Submit
        </button>
      </form>
    </Layout>
  );
}

export default CreateTicket;
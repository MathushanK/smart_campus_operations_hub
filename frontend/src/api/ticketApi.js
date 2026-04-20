import API from "./api";

// Create ticket
export const createTicket = (data) => API.post("/tickets", data);

// Get my tickets
export const getMyTickets = () => API.get("/tickets/my");

// Get all tickets
export const getAllTickets = () => API.get("/tickets");

// Get single ticket
export const getTicketById = (id) => API.get(`/tickets/${id}`);

// Update status
export const updateTicketStatus = (id, status) =>
  API.put(`/tickets/${id}/status?status=${status}`);

// ⭐ IMAGE UPLOAD (NEW)
export const uploadTicketImage = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post(`/tickets/${id}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ⭐ NEW - GET IMAGES
export const getTicketImages = (id) =>
  API.get(`/tickets/${id}/images`);
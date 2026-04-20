import API from "./api";

// Create ticket
export const createTicket = (data) => API.post("/tickets", data);

// Get user tickets
export const getMyTickets = () => API.get("/tickets/my");

// Get single ticket
export const getTicketById = (id) => API.get(`/tickets/${id}`);

// Update ticket (technician)
export const updateTicket = (id, data) => API.put(`/tickets/${id}`, data);

// Upload attachment
export const uploadAttachment = (id, formData) =>
  API.post(`/tickets/${id}/attachments`, formData);
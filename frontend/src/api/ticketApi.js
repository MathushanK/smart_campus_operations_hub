import API from "./api";

// Create ticket
export const createTicket = (data) => API.post("/tickets", data);

// Get my tickets
export const getMyTickets = () => API.get("/tickets/my");

// Get all tickets (technician)
export const getAllTickets = () => API.get("/tickets");

// Get single ticket
export const getTicketById = (id) => API.get(`/tickets/${id}`);

// Update status (FIXED)
export const updateTicketStatus = (id, status) =>
  API.put(`/tickets/${id}/status?status=${status}`);
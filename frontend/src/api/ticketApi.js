import API from "./api";

// CREATE
export const createTicket = (data) => API.post("/tickets", data);

// ✅ FIXED (no user param)
export const getMyTickets = () => API.get("/tickets/my");

export const getAssignedTickets = () => API.get("/tickets/assigned");

// GET ALL
export const getAllTickets = () => API.get("/tickets");

// GET ONE
export const getTicketById = (id) => API.get(`/tickets/${id}`);

// UPDATE STATUS
export const updateTicketStatus = (id, status) =>
  API.put(`/tickets/${id}/status?status=${status}`);

export const updateResolutionNotes = (id, notes) =>
  API.put(`/tickets/${id}/resolution-notes?notes=${encodeURIComponent(notes)}`);

// ✅ IMAGE UPLOAD
export const uploadTicketImage = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post(`/tickets/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// GET IMAGES
export const getTicketImages = (id) =>
  API.get(`/tickets/${id}/images`);

export const getTicketAssignment = (id) => API.get(`/tickets/${id}/assignment`);

// ===================== COMMENTS =====================
export const getTicketComments = (id) => API.get(`/tickets/${id}/comments`);

export const addTicketComment = (id, comment) =>
  API.post(`/tickets/${id}/comments?comment=${encodeURIComponent(comment)}`);

export const updateTicketComment = (commentId, comment) =>
  API.put(`/tickets/comments/${commentId}?comment=${encodeURIComponent(comment)}`);

export const deleteTicketComment = (commentId) =>
  API.delete(`/tickets/comments/${commentId}`);

// ADMIN: technicians list
export const getTechnicians = () => API.get("/admin/users/technicians");


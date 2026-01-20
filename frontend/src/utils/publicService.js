import apiClient from "./apiClient";

/* ===============================
   PUBLIC EVENTS
================================ */

// 🔓 Get all public events
export const getPublicEvents = async () => {
  const res = await apiClient.get("/events");
  return res.data;
};

// 🔓 Get single event details
export const getEventDetails = async (id) => {
  const res = await apiClient.get(`/events/${id}`);
  return res.data;
};

// 🔓 Get sessions for an event
export const getEventSessions = async (eventId) => {
  const res = await apiClient.get(`/sessions/event/${eventId}`);
  return res.data;
};

/* ===============================
   REGISTRATION
================================ */

// 🔓 Register user for session (POST /registrations)
export const registerUser = async (sessionId, data) => {
  const payload = { ...data, masterclassId: sessionId };
  const res = await apiClient.post(`/registrations`, payload);
  return res.data?.data || res.data;
};

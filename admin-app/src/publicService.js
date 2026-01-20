import apiClient from '../utils/apiClient';

/**
 * Fetch all public events
 */
export const getPublicEvents = async () => {
  const response = await apiClient.get('/events');
  return response.data || [];
};

/**
 * Get single event details
 */
export const getEventDetails = async (id) => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data;
};

/**
 * Get masterclasses (agenda) for an event
 */
export const getEventMasterclasses = async (eventId) => {
  // Admin endpoint for sessions by event
  const response = await apiClient.get(`/sessions/event/${eventId}`);
  return response.data || [];
};

/**
 * Register for a masterclass
 * Returns: { success, registration: { qrCode, ... } }
 */
export const registerUser = async (data) => {
  try {
    const response = await apiClient.post('/register', data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Get user's schedule by email
 */
export const getUserRegistrations = async (email) => {
  try {
    const response = await apiClient.get(`/registrations/user/${email}`);
    return response.data;
  } catch (error) {
    console.error('Fetch schedule error:', error);
    throw error;
  }
};
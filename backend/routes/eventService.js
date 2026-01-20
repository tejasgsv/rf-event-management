import apiClient from '../utils/apiClient';

/**
 * Fetch all published events for public view
 * Endpoint: GET /api/events
 */
export const getPublicEvents = async () => {
  try {
    const response = await apiClient.get('/events');
    // Backend returns the array directly for public endpoint
    return response.data || [];
  } catch (error) {
    console.error('Error fetching public events:', error);
    throw error;
  }
};

/**
 * Get single event details
 */
export const getEventById = async (id) => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data;
};
import axios from 'axios';

// Use environment variable or fallback to default (for backward compatibility)
// Backend runs on 5000/5001 depending on env
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:5000/api';

const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 10000
});

// Frontend doesn't have auth - it's public access
// No need to attach tokens
apiClient.interceptors.request.use((config) => {
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;

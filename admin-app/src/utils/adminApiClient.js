import axios from "axios";

/**
 * Admin API Client
 * Base: /api/admin
 * Uses VITE_ADMIN_API_URL environment variable
 */
const baseURL = import.meta.env.VITE_ADMIN_API_URL || "http://127.0.0.1:5000/api/admin";

const adminApiClient = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach admin token automatically
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally (session expired)
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("activeEventId");
      
      // Redirect to login
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default adminApiClient;

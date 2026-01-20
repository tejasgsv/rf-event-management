import axios from "axios";

/**
 * ==================================================
 * Admin API Client
 * Uses VITE_ADMIN_API_URL environment variable
 * Fallback: http://127.0.0.1:5000/api/admin
 * ==================================================
 */

const baseURL = import.meta.env.VITE_ADMIN_API_URL || "http://127.0.0.1:5000/api/admin";

const adminApiClient = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
adminApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Admin request error:", error);
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // 🔐 Logout ONLY on real auth failure
    if (status === 401 && !url.includes("/login")) {
      console.warn("⚠️ Admin token expired or invalid");

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("activeEventId");

      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    if (error.response?.data?.message) {
      console.error(
        "❌ Admin API Error:",
        error.response.data.message
      );
    }

    return Promise.reject(error);
  }
);

export default adminApiClient;

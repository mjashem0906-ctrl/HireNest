import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://jobbridge.com"),
  withCredentials: true
});

// Add request interceptor for logging and auth
API.interceptors.request.use(
  (config) => {
    // 1. Log request
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);

    // 2. Add Token from LocalStorage (Fallback for cookies)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    const isAuthCheck = error.config?.url?.includes("/auth/check");
    const is401 = error.response?.status === 401;

    // Suppress console.error for expected 401 on routine /auth/check calls
    if (!is401 || !isAuthCheck) {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message
      });
    }

    // Handle specific errors
    if (is401) {
      // Only warn if this is not a routine auth check call (avoid console noise on landing/login page loads)
      if (!isAuthCheck) {
        console.warn("Unauthorized access. Redirecting to login...");
      }
      // You can add redirect logic here if needed
    }

    return Promise.reject(error);
  }
);

export default API;


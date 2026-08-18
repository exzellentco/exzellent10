import axios from "axios";

// In dev, use a RELATIVE baseURL ("") so every /api call goes through the Vite
// dev proxy (vite.config.js → mock backend on :5000). This removes the reliance
// on a local .env.local and, critically, prevents a missing/incorrect env var
// from silently pointing admin writes (delete student/course, etc.) at the real
// production backend. In a production build we use the configured backend URL.
const BASE_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_BACKEND_BASE_URL || "");

// Create axios instance
const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include access token
instance.interceptors.request.use(
  (config) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop by checking if the request is to the refresh token endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/users/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // Create a separate axios instance for refresh token to avoid interceptors
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/users/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = refreshResponse.data;
        document.cookie = `token=${accessToken}; path=/; max-age=${
          60 * 60 * 12
        }; SameSite=Strict`;
        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return instance(originalRequest);
      } catch (error) {
        console.log("error", error);
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

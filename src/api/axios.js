import axios from 'axios';

/**
 * FlexiStore Pro Centralized Axios Client Instance
 * ------------------------------------------------
 * - Dynamically attaches VITE_API_BASE_URL in production (Vercel -> Render)
 * - Uses relative URLs in development (Vite local proxy)
 * - Automatically injects the Sanctum Bearer Token from localStorage on every request
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach authentication token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flexi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (e.g. 401 session expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('flexi_token');
      localStorage.removeItem('flexi_user');
    }
    return Promise.reject(error);
  }
);

// Configure the default axios global instance as well for backward compatibility
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

export default api;
export { api, axios };

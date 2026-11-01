import axios from 'axios';

/**
 * FlexiStore Pro Centralized Axios Client Instance
 * ------------------------------------------------
 * - Uses VITE_API_URL environment variable: import.meta.env.VITE_API_URL
 * - Fallbacks to VITE_API_BASE_URL or 'https://my-project-backend.ethiodeploy.app/api'
 * - Automatically trims trailing slashes and ensures standard '/api' suffix
 * - Normalizes request paths so leading '/api/' doesn't cause '/api/api/...' duplication
 * - Automatically injects the Sanctum Bearer Token from localStorage on every request
 * - Cleans up session credentials on 401 unauthorized errors
 */
const DEFAULT_BACKEND_API = 'https://my-project-backend.ethiodeploy.app/api';

const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return DEFAULT_BACKEND_API;
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  // If user provided origin without /api (e.g. https://my-project-backend.ethiodeploy.app), append /api
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_BASE_URL = resolveBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

/**
 * Safe local storage reader
 */
const getAuthToken = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('flexi_token') : null;
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('flexi_token');
      localStorage.removeItem('flexi_user');
    }
  } catch {}
};

/**
 * URL Normalizer: If a request URL begins with '/api/', strip leading '/api'
 * so baseURL ('.../api') does not duplicate into '.../api/api/...'
 */
const normalizeRequestUrl = (config) => {
  if (config?.url && typeof config.url === 'string') {
    // Only rewrite relative paths, leave absolute URLs (http:// or https://) untouched
    if (!/^https?:\/\//i.test(config.url)) {
      if (config.url.startsWith('/api/')) {
        config.url = config.url.slice(4);
      } else if (config.url === '/api') {
        config.url = '';
      }
    }
  }
  return config;
};

// Request Interceptor: Attach authentication token and normalize URL
api.interceptors.request.use(
  (config) => {
    normalizeRequestUrl(config);
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
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
      clearAuthStorage();
    }
    return Promise.reject(error);
  }
);

// Configure the default axios global instance as well for backward compatibility
axios.defaults.baseURL = API_BASE_URL;
axios.interceptors.request.use(
  (config) => {
    normalizeRequestUrl(config);
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
export { api, axios };

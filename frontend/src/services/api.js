import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

// Attach the JWT to every outgoing request, if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize the "expired/invalid token" case: bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Pulls a human-readable message out of our backend's ErrorResponse shape.
export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (data.validationErrors) {
    return Object.values(data.validationErrors).join(' · ');
  }
  return data.message || 'Something went wrong. Please try again.';
}

export default api;

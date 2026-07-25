import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

// Attach the JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // KA SOO DAA: Haddii aan token jirin, ka saar header-kii hore si aanu xog khaldan u meel-maraynin
    delete config.headers.Authorization;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Centralize response & error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // KA SOO DAA: Hubi in Sign Up ama Register la joogo ka hor inta aana la redirect-garayn
      const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/signup');
      
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (data.validationErrors) {
    return Object.values(data.validationErrors).join(' · ');
  }
  return data.message || 'Something went wrong. Please try again.';
}

export default api;
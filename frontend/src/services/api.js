import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ridesmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ridesmart_token');
      localStorage.removeItem('ridesmart_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const busAPI = {
  // Passenger-facing search — any authenticated user
  search: (params) => API.get('/buses/search', { params }),
  // Admin/manager bus inventory management
  getAll: () => API.get('/buses'),
  getOne: (id) => API.get(`/buses/${id}`),
  create: (data) => API.post('/buses', data),
  update: (id, data) => API.put(`/buses/${id}`, data),
  remove: (id) => API.delete(`/buses/${id}`),
};

export default API;

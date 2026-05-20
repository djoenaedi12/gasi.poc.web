import axios from 'axios';

export const api = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL ?? '',
  headers:         { 'Content-Type': 'application/json' },
  timeout:         15000,
  withCredentials: true, // httpOnly cookie otomatis ikut di setiap request
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Cookie expired atau tidak valid — redirect ke login
      // useAppStore.clearSession() dipanggil oleh plugin-auth via onStop
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

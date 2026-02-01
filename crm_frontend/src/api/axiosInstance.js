// src/api/axiosInstance.js
import axios from 'axios';

const baseURL = 'https://genhub-crm.onrender.com/api/'; // ✅ Add trailing slash

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach Authorization token before every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auto-refresh expired token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh')
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}token/refresh/`, {
          refresh: localStorage.getItem('refresh'),
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('access', newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('employeeId');
        window.location.href = '/employees/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

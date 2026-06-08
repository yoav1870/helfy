import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || 'An error occurred';

    const apiError = new Error(message);
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;

    return Promise.reject(apiError);
  }
);

export default api;

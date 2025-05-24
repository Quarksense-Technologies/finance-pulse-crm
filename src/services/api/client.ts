
import axios from 'axios';
import { toast } from "@/hooks/use-toast";

const apiClient = axios.create({
  baseURL: 'https://bms.quarksense.in/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add the auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors and refresh token
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const originalRequest = error.config;
    
    // Handle authentication errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        toast({
          title: "Session expired",
          description: "Please login again to continue",
          variant: "destructive"
        });
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

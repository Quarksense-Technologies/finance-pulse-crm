
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

// Use a default API URL that works in development environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with an error status
      const message = error.response.data?.message || 'An error occurred';
      
      if (error.response.status === 401) {
        // Clear auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login only if not already on login page
        const isLoginPage = window.location.pathname === '/login';
        if (!isLoginPage) {
          window.location.href = '/login';
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive"
          });
        }
      }
      
      // Toast other errors except 401 (which has special handling)
      if (error.response.status !== 401) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      toast({
        title: "Network Error",
        description: "Cannot connect to the server. Please check your internet connection.",
        variant: "destructive"
      });
    } else {
      // Something happened in setting up the request
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

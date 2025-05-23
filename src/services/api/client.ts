
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

// Get API URL from environment variables and ensure it uses HTTPS
let API_URL = import.meta.env.VITE_API_URL || 'https://65.0.4.219:5000/api';

// Convert API_URL to HTTPS if it's using HTTP and we're on a secure connection
if (API_URL.startsWith('http:') && window.location.protocol === 'https:') {
  API_URL = API_URL.replace('http:', 'https:');
  console.log('Converted API URL to HTTPS:', API_URL);
}

console.log('Using API URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent hanging requests
  timeout: 15000,
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

// Handle API responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Check if this is a mixed content error
    if (error.message && error.message.includes('Mixed Content')) {
      toast({
        title: "Security Error",
        description: "Mixed content error. The API must be accessed over HTTPS when the app is loaded securely.",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
    
    // Check if the error is due to network issues
    if (!error.response) {
      toast({
        title: "Network Error",
        description: "Cannot connect to the API server. Please check your internet connection and ensure the API server is running.",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
    
    // Get the error message from the API response or use a default
    const errorMessage = error.response?.data?.message || 'An unknown error occurred';
    
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
    } else if (error.response.status === 404) {
      console.warn('API endpoint not found:', error.config.url);
      toast({
        title: "Resource Not Found",
        description: errorMessage,
        variant: "destructive"
      });
    } else if (error.response.status === 500) {
      console.error('Server Error:', error.response.data);
      
      // Check if this is a MongoDB connection timeout issue
      const isMongoDBTimeout = errorMessage.includes('buffering timed out') || 
                              errorMessage.includes('Operation') && 
                              errorMessage.includes('timed out');
      
      if (isMongoDBTimeout) {
        toast({
          title: "Database Connection Error",
          description: "The server couldn't connect to the database. The database might be starting up or experiencing issues.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Server Error",
          description: "The server encountered an error. Please try again later or contact support.",
          variant: "destructive"
        });
      }
    } else {
      // Handle other status codes
      toast({
        title: `Error (${error.response.status})`,
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    return Promise.reject(error);
  }
);

// Add a helper method to check if an error is a specific HTTP status code
export const isHttpError = (error: any, statusCode: number): boolean => {
  return error?.response?.status === statusCode;
};

// Helper to check if error is a specific type
export const isMongoDbTimeoutError = (error: any): boolean => {
  const errorMessage = error?.response?.data?.message || '';
  return error?.response?.status === 500 && 
         (errorMessage.includes('buffering timed out') || 
          (errorMessage.includes('Operation') && errorMessage.includes('timed out')));
};

export default apiClient;

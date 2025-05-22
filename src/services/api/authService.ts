
// src/services/api/authService.ts
import apiClient from './client';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Auth service: Attempting login with:', credentials.email);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      console.log('Auth service: Login successful, received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Auth service: Login failed:', error);
      throw error;
    }
  },
  
  async register(userData: RegisterData): Promise<AuthResponse> {
    console.log('Auth service: Attempting registration for:', userData.email);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      console.log('Auth service: Registration successful');
      return response.data;
    } catch (error) {
      console.error('Auth service: Registration failed:', error);
      throw error;
    }
  },
  
  async getCurrentUser() {
    console.log('Auth service: Fetching current user');
    try {
      const response = await apiClient.get('/auth/me');
      console.log('Auth service: Current user fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Auth service: Failed to fetch current user:', error);
      throw error;
    }
  },
  
  logout() {
    console.log('Auth service: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

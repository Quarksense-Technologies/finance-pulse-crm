
import apiClient from './client';
import { User } from '@/data/types';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

interface UpdateProfileData {
  name?: string;
  theme?: string;
  profileImage?: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    // Transform API response to match our frontend User type
    return response.data.map((user: any) => ({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || new Date().toISOString()
    }));
  },
  
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    // Transform API response to match our frontend User type
    return {
      id: response.data._id || response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      managerId: response.data.managerId,
      createdAt: response.data.createdAt || new Date().toISOString()
    };
  },
  
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', userData);
    // Transform API response to match our frontend User type
    return {
      id: response.data._id || response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      managerId: response.data.managerId,
      createdAt: response.data.createdAt || new Date().toISOString()
    };
  },
  
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    // Transform API response to match our frontend User type
    return {
      id: response.data._id || response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      managerId: response.data.managerId,
      createdAt: response.data.createdAt || new Date().toISOString()
    };
  },
  
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    const response = await apiClient.put('/users/profile/update', profileData);
    // Transform API response to match our frontend User type
    return {
      id: response.data._id || response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      managerId: response.data.managerId,
      createdAt: response.data.createdAt || new Date().toISOString()
    };
  }
};

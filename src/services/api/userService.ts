
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
    return response.data;
  },
  
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    const response = await apiClient.put('/users/profile/update', profileData);
    return response.data;
  }
};

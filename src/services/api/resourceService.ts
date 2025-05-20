
import apiClient from './client';
import { Resource } from '@/data/types';
import { toast } from "@/components/ui/use-toast";

export interface CreateResourceData {
  name: string;
  role: string;
  hoursAllocated: number;
  hourlyRate: number;
  startDate: string;
  endDate?: string | null;
  projectId: string;
}

export interface UpdateResourceData {
  name?: string;
  role?: string;
  hoursAllocated?: number;
  hourlyRate?: number;
  startDate?: string;
  endDate?: string | null;
}

export const resourceService = {
  async getResources(projectId?: string): Promise<Resource[]> {
    try {
      let url = '/resources';
      if (projectId) {
        url = `/projects/${projectId}/resources`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  async getResourceById(id: string): Promise<Resource> {
    try {
      const response = await apiClient.get(`/resources/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching resource ${id}:`, error);
      throw error;
    }
  },

  async createResource(resourceData: CreateResourceData): Promise<Resource> {
    try {
      const response = await apiClient.post(`/projects/${resourceData.projectId}/resources`, resourceData);
      toast({
        title: "Success",
        description: "Resource allocated successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  async updateResource(id: string, resourceData: UpdateResourceData): Promise<Resource> {
    try {
      const response = await apiClient.put(`/resources/${id}`, resourceData);
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating resource ${id}:`, error);
      throw error;
    }
  },

  async deleteResource(id: string): Promise<void> {
    try {
      await apiClient.delete(`/resources/${id}`);
      toast({
        title: "Success",
        description: "Resource removed successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting resource ${id}:`, error);
      throw error;
    }
  }
};

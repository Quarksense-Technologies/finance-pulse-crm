
import { toast } from "@/components/ui/use-toast";
import apiClient from './client';
import { Resource } from '@/data/types';

export interface ResourceSummary {
  totalAllocated: number;
  averageCost: number;
  projectsWithResources: number;
}

export interface CreateResourceData {
  projectId: string;
  name: string;
  role: string;
  hoursAllocated: number;
  hourlyRate: number;
  startDate: string;
  endDate?: string | null;
}

export const resourceService = {
  async getResources(projectId?: string): Promise<Resource[]> {
    try {
      const url = projectId ? `/projects/${projectId}/resources` : '/resources';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive"
      });
      return [];
    }
  },

  async getResourcesSummary(): Promise<ResourceSummary> {
    try {
      const response = await apiClient.get('/resources/summary');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching resources summary:', error);
      toast({
        title: "Error",
        description: "Failed to load resources summary",
        variant: "destructive"
      });
      // Return default summary if API fails
      return {
        totalAllocated: 0,
        averageCost: 0,
        projectsWithResources: 0
      };
    }
  },

  async addResource(resource: CreateResourceData): Promise<Resource> {
    try {
      const response = await apiClient.post(`/projects/${resource.projectId}/resources`, resource);
      toast({
        title: "Success", 
        description: "Resource added successfully"
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding resource:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add resource",
        variant: "destructive"
      });
      throw error;
    }
  },

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    try {
      const response = await apiClient.put(`/resources/${id}`, data);
      toast({
        title: "Success",
        description: "Resource updated successfully"
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating resource:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update resource",
        variant: "destructive"
      });
      throw error;
    }
  },

  async deleteResource(id: string): Promise<void> {
    try {
      await apiClient.delete(`/resources/${id}`);
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete resource",
        variant: "destructive"
      });
      throw error;
    }
  }
};


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
        url = `/resources/project/${projectId}`;
      }
      
      console.log(`Fetching resources from: ${url}`);
      const response = await apiClient.get(url);
      console.log('Resources response:', response.data);
      
      // Transform the response to ensure consistent format
      let resources = response.data;
      if (response.data.data) {
        resources = response.data.data;
      }
      
      if (!Array.isArray(resources)) {
        console.error('Expected resources array, got:', typeof resources, resources);
        return [];
      }
      
      // Transform resources to ensure proper format
      const transformedResources = resources.map((resource: any) => ({
        id: resource._id || resource.id,
        name: resource.name || '',
        projectId: resource.projectId || '',
        role: resource.role || '',
        hoursAllocated: resource.hoursAllocated || 0,
        hourlyRate: resource.hourlyRate || 0,
        startDate: resource.startDate,
        endDate: resource.endDate
      }));
      
      console.log('Transformed resources:', transformedResources);
      return transformedResources;
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  async getResourceById(id: string): Promise<Resource> {
    try {
      const response = await apiClient.get(`/resources/${id}`);
      return {
        id: response.data._id || response.data.id,
        name: response.data.name || '',
        projectId: response.data.projectId || '',
        role: response.data.role || '',
        hoursAllocated: response.data.hoursAllocated || 0,
        hourlyRate: response.data.hourlyRate || 0,
        startDate: response.data.startDate,
        endDate: response.data.endDate
      };
    } catch (error: any) {
      console.error(`Error fetching resource ${id}:`, error);
      throw error;
    }
  },

  async createResource(resourceData: CreateResourceData): Promise<Resource> {
    try {
      console.log('Creating resource with data:', resourceData);
      const response = await apiClient.post(`/projects/${resourceData.projectId}/resources`, resourceData);
      console.log('Resource creation response:', response.data);
      
      toast({
        title: "Success",
        description: "Resource allocated successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        name: response.data.name || '',
        projectId: response.data.projectId || resourceData.projectId,
        role: response.data.role || '',
        hoursAllocated: response.data.hoursAllocated || 0,
        hourlyRate: response.data.hourlyRate || 0,
        startDate: response.data.startDate,
        endDate: response.data.endDate
      };
    } catch (error: any) {
      console.error('Error creating resource:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create resource';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update resource';
      
      toast({
        title: "Error",
        description: errorMessage,
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
        description: "Resource removed successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting resource ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete resource';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }
};

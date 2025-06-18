
import apiClient from './client';
import { Resource, ProjectResourceAllocation } from '@/data/types';
import { toast } from "@/components/ui/use-toast";

export interface CreateResourceData {
  name: string;
  role: string;
  email: string;
  phone?: string;
  hourlyRate: number;
  skills?: string[];
  department?: string;
}

export interface UpdateResourceData {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  hourlyRate?: number;
  skills?: string[];
  department?: string;
  isActive?: boolean;
}

export interface AllocateResourceData {
  resourceId: string;
  hoursAllocated: number;
  startDate: string;
  endDate?: string | null;
}

export const resourceService = {
  // Resource Management
  async getResources(): Promise<Resource[]> {
    try {
      console.log('Fetching all resources');
      const response = await apiClient.get('/resources');
      console.log('Resources response:', response.data);
      
      let resources = response.data;
      if (response.data.data) {
        resources = response.data.data;
      }
      
      if (!Array.isArray(resources)) {
        console.error('Expected resources array, got:', typeof resources, resources);
        return [];
      }
      
      const transformedResources = resources.map((resource: any) => ({
        id: resource._id || resource.id,
        name: resource.name || '',
        role: resource.role || '',
        email: resource.email || '',
        phone: resource.phone,
        hourlyRate: resource.hourlyRate || 0,
        skills: resource.skills || [],
        department: resource.department,
        isActive: resource.isActive !== undefined ? resource.isActive : true,
        createdAt: resource.createdAt
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
        role: response.data.role || '',
        email: response.data.email || '',
        phone: response.data.phone,
        hourlyRate: response.data.hourlyRate || 0,
        skills: response.data.skills || [],
        department: response.data.department,
        isActive: response.data.isActive !== undefined ? response.data.isActive : true,
        createdAt: response.data.createdAt
      };
    } catch (error: any) {
      console.error(`Error fetching resource ${id}:`, error);
      throw error;
    }
  },

  async createResource(resourceData: CreateResourceData): Promise<Resource> {
    try {
      console.log('Creating resource with data:', resourceData);
      const response = await apiClient.post('/resources', resourceData);
      console.log('Resource creation response:', response.data);
      
      toast({
        title: "Success",
        description: "Resource created successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        name: response.data.name || '',
        role: response.data.role || '',
        email: response.data.email || '',
        phone: response.data.phone,
        hourlyRate: response.data.hourlyRate || 0,
        skills: response.data.skills || [],
        department: response.data.department,
        isActive: response.data.isActive !== undefined ? response.data.isActive : true,
        createdAt: response.data.createdAt
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
      return {
        id: response.data._id || response.data.id,
        name: response.data.name || '',
        role: response.data.role || '',
        email: response.data.email || '',
        phone: response.data.phone,
        hourlyRate: response.data.hourlyRate || 0,
        skills: response.data.skills || [],
        department: response.data.department,
        isActive: response.data.isActive !== undefined ? response.data.isActive : true,
        createdAt: response.data.createdAt
      };
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
        description: "Resource deactivated successfully",
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
  },

  // Project Resource Allocation
  async getProjectResources(projectId: string): Promise<ProjectResourceAllocation[]> {
    try {
      console.log(`Fetching allocated resources for project: ${projectId}`);
      const response = await apiClient.get(`/resources/project/${projectId}`);
      console.log('Project resources response:', response.data);
      
      let allocations = response.data;
      if (response.data.data) {
        allocations = response.data.data;
      }
      
      if (!Array.isArray(allocations)) {
        console.error('Expected allocations array, got:', typeof allocations, allocations);
        return [];
      }
      
      const transformedAllocations = allocations.map((allocation: any) => ({
        id: allocation._id || allocation.id,
        projectId: allocation.projectId._id || allocation.projectId,
        resourceId: allocation.resourceId._id || allocation.resourceId,
        resource: allocation.resourceId ? {
          id: allocation.resourceId._id || allocation.resourceId.id,
          name: allocation.resourceId.name,
          role: allocation.resourceId.role,
          email: allocation.resourceId.email,
          phone: allocation.resourceId.phone,
          hourlyRate: allocation.resourceId.hourlyRate || 0,
          skills: allocation.resourceId.skills || [],
          department: allocation.resourceId.department,
          isActive: allocation.resourceId.isActive !== undefined ? allocation.resourceId.isActive : true
        } : undefined,
        hoursAllocated: allocation.hoursAllocated || 0,
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        isActive: allocation.isActive !== undefined ? allocation.isActive : true,
        createdAt: allocation.createdAt
      }));
      
      console.log('Transformed project allocations:', transformedAllocations);
      return transformedAllocations;
    } catch (error: any) {
      console.error(`Error fetching project resources for ${projectId}:`, error);
      if (error.response?.status === 404) {
        console.log('No resources found for this project');
        return [];
      }
      throw error;
    }
  },

  async allocateResourceToProject(projectId: string, allocationData: AllocateResourceData): Promise<ProjectResourceAllocation> {
    try {
      console.log('Allocating resource to project:', { projectId, allocationData });
      const response = await apiClient.post(`/resources/project/${projectId}/allocate`, allocationData);
      console.log('Resource allocation response:', response.data);
      
      toast({
        title: "Success",
        description: "Resource allocated to project successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        projectId: response.data.projectId._id || response.data.projectId,
        resourceId: response.data.resourceId._id || response.data.resourceId,
        resource: response.data.resourceId ? {
          id: response.data.resourceId._id || response.data.resourceId.id,
          name: response.data.resourceId.name,
          role: response.data.resourceId.role,
          email: response.data.resourceId.email,
          phone: response.data.resourceId.phone,
          hourlyRate: response.data.resourceId.hourlyRate || 0,
          skills: response.data.resourceId.skills || [],
          department: response.data.resourceId.department,
          isActive: response.data.resourceId.isActive !== undefined ? response.data.resourceId.isActive : true
        } : undefined,
        hoursAllocated: response.data.hoursAllocated || 0,
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        isActive: response.data.isActive !== undefined ? response.data.isActive : true,
        createdAt: response.data.createdAt
      };
    } catch (error: any) {
      console.error('Error allocating resource to project:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to allocate resource';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async updateResourceAllocation(id: string, allocationData: Partial<AllocateResourceData>): Promise<ProjectResourceAllocation> {
    try {
      const response = await apiClient.put(`/resources/project-allocation/${id}`, allocationData);
      
      toast({
        title: "Success",
        description: "Resource allocation updated successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        projectId: response.data.projectId._id || response.data.projectId,
        resourceId: response.data.resourceId._id || response.data.resourceId,
        resource: response.data.resourceId ? {
          id: response.data.resourceId._id || response.data.resourceId.id,
          name: response.data.resourceId.name,
          role: response.data.resourceId.role,
          email: response.data.resourceId.email,
          phone: response.data.resourceId.phone,
          hourlyRate: response.data.resourceId.hourlyRate || 0,
          skills: response.data.resourceId.skills || [],
          department: response.data.resourceId.department,
          isActive: response.data.resourceId.isActive !== undefined ? response.data.resourceId.isActive : true
        } : undefined,
        hoursAllocated: response.data.hoursAllocated || 0,
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        isActive: response.data.isActive !== undefined ? response.data.isActive : true,
        createdAt: response.data.createdAt
      };
    } catch (error: any) {
      console.error(`Error updating resource allocation ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update resource allocation';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async removeResourceAllocation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/resources/project-allocation/${id}`);
      toast({
        title: "Success",
        description: "Resource allocation removed successfully",
      });
    } catch (error: any) {
      console.error(`Error removing resource allocation ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove resource allocation';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }
};

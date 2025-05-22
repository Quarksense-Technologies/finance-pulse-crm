
import { toast } from "@/components/ui/use-toast";
import apiClient from './client';
import { Project, Payment, Expense, Resource } from '@/data/types';

export interface CreateProjectData {
  name: string;
  description: string;
  company: string;  // Company ID
  startDate: string;
  endDate?: string | null;
  status: string;
  budget?: number;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  company?: string;  // Company ID
  startDate?: string;
  endDate?: string | null;
  status?: string;
  budget?: number;
}

export const projectService = {
  async getProjects(filters?: { status?: string; companyId?: string }): Promise<Project[]> {
    try {
      const response = await apiClient.get('/projects', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
      throw error;
    }
  },

  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching project ${id}:`, error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive"
      });
      throw error;
    }
  },

  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const response = await apiClient.post('/projects', projectData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create project",
        variant: "destructive"
      });
      throw error;
    }
  },

  async updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating project ${id}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update project",
        variant: "destructive"
      });
      throw error;
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/${id}`);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting project ${id}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete project",
        variant: "destructive"
      });
      throw error;
    }
  },

  // Payment methods
  async addPayment(projectId: string, paymentData: Omit<Payment, 'id' | 'projectId'>): Promise<Payment> {
    try {
      const response = await apiClient.post(`/projects/${projectId}/payments`, paymentData);
      toast({
        title: "Success",
        description: "Payment added successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add payment",
        variant: "destructive"
      });
      throw error;
    }
  },

  // Expense methods
  async addExpense(projectId: string, expenseData: Omit<Expense, 'id' | 'projectId'>): Promise<Expense> {
    try {
      const response = await apiClient.post(`/projects/${projectId}/expenses`, expenseData);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add expense",
        variant: "destructive"
      });
      throw error;
    }
  },

  // Resource methods
  async addResource(projectId: string, resourceData: Omit<Resource, 'id' | 'projectId'>): Promise<Resource> {
    try {
      const response = await apiClient.post(`/projects/${projectId}/resources`, resourceData);
      toast({
        title: "Success",
        description: "Resource assigned successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding resource:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign resource",
        variant: "destructive"
      });
      throw error;
    }
  }
};

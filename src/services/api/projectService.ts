import { toast } from "@/hooks/use-toast";
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

// Transform backend project data to frontend format
const transformProject = (backendProject: any): Project => {
  console.log('Transforming project data:', backendProject);
  
  // Handle different ways the backend might return company data
  let companyId = '';
  let companyName = 'Unknown Company';
  
  // Handle populated company object
  if (backendProject.companyId) {
    if (typeof backendProject.companyId === 'object' && backendProject.companyId._id) {
      companyId = backendProject.companyId._id;
      companyName = backendProject.companyId.name || 'Unknown Company';
    } else if (typeof backendProject.companyId === 'object' && backendProject.companyId.id) {
      companyId = backendProject.companyId.id;
      companyName = backendProject.companyId.name || 'Unknown Company';
    } else if (typeof backendProject.companyId === 'string') {
      companyId = backendProject.companyId;
    }
  }
  
  // Fallback to company field
  if (!companyId && backendProject.company) {
    if (typeof backendProject.company === 'object' && backendProject.company._id) {
      companyId = backendProject.company._id;
      companyName = backendProject.company.name || 'Unknown Company';
    } else if (typeof backendProject.company === 'object' && backendProject.company.id) {
      companyId = backendProject.company.id;
      companyName = backendProject.company.name || 'Unknown Company';
    } else if (typeof backendProject.company === 'string') {
      companyId = backendProject.company;
    }
  }
  
  // Use companyName from direct field if available
  if (backendProject.companyName) {
    companyName = backendProject.companyName;
  }
  
  // Calculate totals including resource costs
  const payments = backendProject.payments || [];
  const expenses = backendProject.expenses || [];
  const resources = backendProject.resources || [];
  
  const totalPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  const resourceCosts = resources.reduce((sum: number, r: any) => 
    sum + ((r.hoursAllocated || 0) * (r.hourlyRate || 0)), 0);
  const totalExpensesWithResources = totalExpenses + resourceCosts;
  
  const profit = totalPayments - totalExpensesWithResources;
  
  console.log('Transformed project:', {
    id: backendProject._id || backendProject.id,
    name: backendProject.name,
    companyId,
    companyName,
    totalPayments,
    totalExpenses: totalExpensesWithResources,
    profit
  });
  
  return {
    id: backendProject._id || backendProject.id,
    name: backendProject.name || '',
    description: backendProject.description || '',
    companyId: companyId,
    companyName: companyName,
    startDate: backendProject.startDate,
    endDate: backendProject.endDate,
    status: backendProject.status || 'planning',
    budget: backendProject.budget,
    manpowerAllocated: backendProject.manpowerAllocated || 0,
    managers: backendProject.managers || [],
    team: backendProject.team || [],
    payments: payments,
    expenses: expenses,
    resources: resources,
    totalPayments: totalPayments,
    totalExpenses: totalExpensesWithResources,
    profit: profit
  };
};

export const projectService = {
  async getProjects(filters?: { status?: string; companyId?: string }): Promise<Project[]> {
    try {
      console.log('Fetching projects with filters:', filters);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await apiClient.get('/projects', { 
        params: filters
      });
      console.log('Raw projects response:', response.data);
      
      let projects = response.data;
      if (response.data.data) {
        projects = response.data.data;
      }
      
      if (!Array.isArray(projects)) {
        console.error('Expected projects array, got:', typeof projects, projects);
        return [];
      }
      
      const transformedProjects = projects.map(transformProject);
      console.log('Transformed projects:', transformedProjects);
      
      return transformedProjects;
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load projects';
      
      if (error.response?.status !== 401) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      throw error;
    }
  },

  async getProjectById(id: string): Promise<Project> {
    try {
      console.log(`Fetching project details for ID: ${id}`);
      const response = await apiClient.get(`/projects/${id}`);
      console.log('Project details response:', response.data);
      return transformProject(response.data);
    } catch (error: any) {
      console.error(`Error fetching project ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load project details';
      
      if (error.response?.status !== 401) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      throw error;
    }
  },

  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      console.log('Creating project with data:', projectData);
      const response = await apiClient.post('/projects', projectData);
      console.log('Create project response:', response.data);
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      
      return transformProject(response.data);
    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create project';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
    try {
      console.log(`Updating project ${id} with data:`, projectData);
      const response = await apiClient.put(`/projects/${id}`, projectData);
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      
      return transformProject(response.data);
    } catch (error: any) {
      console.error(`Error updating project ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update project';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      console.log(`Deleting project ${id}`);
      await apiClient.delete(`/projects/${id}`);
      
      toast({
        title: "Success",
        description: "Project and all associated data deleted successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting project ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete project';
      
      toast({
        title: "Error",
        description: errorMessage,
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add payment';
      
      toast({
        title: "Error",
        description: errorMessage,
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add expense';
      
      toast({
        title: "Error",
        description: errorMessage,
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign resource';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }
};

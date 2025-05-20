
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, CreateProjectData, UpdateProjectData } from '@/services/api/projectService';
import { Payment, Expense, Resource } from '@/data/types';

export const useProjects = (filters?: { status?: string; companyId?: string }) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData: CreateProjectData) => projectService.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) => 
      projectService.updateProject(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, paymentData }: { projectId: string; paymentData: Omit<Payment, 'id' | 'projectId'> }) => 
      projectService.addPayment(projectId, paymentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, expenseData }: { projectId: string; expenseData: Omit<Expense, 'id' | 'projectId'> }) => 
      projectService.addExpense(projectId, expenseData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
  });
};

export const useAddResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, resourceData }: { projectId: string; resourceData: Omit<Resource, 'id' | 'projectId'> }) => 
      projectService.addResource(projectId, resourceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

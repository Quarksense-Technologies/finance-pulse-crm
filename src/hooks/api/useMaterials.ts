
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService, CreateMaterialRequestData, CreateMaterialPurchaseData } from '@/services/api/materialService';

export const useMaterialRequests = (filters?: { project?: string; status?: string }) => {
  return useQuery({
    queryKey: ['materialRequests', filters],
    queryFn: () => materialService.getMaterialRequests(filters),
  });
};

export const useMaterialRequestById = (id: string) => {
  return useQuery({
    queryKey: ['materialRequest', id],
    queryFn: () => materialService.getMaterialRequestById(id),
    enabled: !!id,
  });
};

export const useMaterialPurchases = (filters?: { project?: string }) => {
  return useQuery({
    queryKey: ['materialPurchases', filters],
    queryFn: () => materialService.getMaterialPurchases(filters),
  });
};

export const useMaterialPurchaseById = (id: string) => {
  return useQuery({
    queryKey: ['materialPurchase', id],
    queryFn: () => materialService.getMaterialPurchaseById(id),
    enabled: !!id,
  });
};

export const useMaterialExpenses = (filters?: { project?: string }) => {
  return useQuery({
    queryKey: ['materialExpenses', filters],
    queryFn: () => materialService.getMaterialExpenses(filters),
  });
};

export const useMaterialExpenseById = (id: string) => {
  return useQuery({
    queryKey: ['materialExpense', id],
    queryFn: () => materialService.getMaterialExpenseById(id),
    enabled: !!id,
  });
};

export const useCreateMaterialRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMaterialRequestData) => materialService.createMaterialRequest(data),
    onSuccess: (data, variables) => {
      // Invalidate material requests queries
      queryClient.invalidateQueries({ queryKey: ['materialRequests'] });
      
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      
      // Invalidate project-specific queries
      queryClient.invalidateQueries({ queryKey: ['materialRequests', { project: variables.projectId }] });
    },
  });
};

export const useCreateMaterialPurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMaterialPurchaseData) => materialService.createMaterialPurchase(data),
    onSuccess: (data, variables) => {
      // Invalidate material purchases queries
      queryClient.invalidateQueries({ queryKey: ['materialPurchases'] });
      
      // Invalidate material expenses queries
      queryClient.invalidateQueries({ queryKey: ['materialExpenses'] });
      
      // Invalidate transactions (since expense is auto-created)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      
      // Invalidate project-specific queries
      queryClient.invalidateQueries({ queryKey: ['materialPurchases', { project: variables.projectId }] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

export const useDeleteMaterialRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: materialService.deleteMaterialRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materialRequests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
};

export const useDeleteMaterialPurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: materialService.deleteMaterialPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materialPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['materialExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
  });
};

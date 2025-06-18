
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService, CreateResourceData, UpdateResourceData, AllocateResourceData } from '@/services/api/resourceService';

// Resource Management Hooks
export const useResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => resourceService.getResources(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useResource = (id: string) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourceService.getResourceById(id),
    enabled: !!id,
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateResourceData) => resourceService.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceData }) => 
      resourceService.updateResource(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', variables.id] });
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resourceService.deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

// Project Resource Allocation Hooks
export const useProjectResources = (projectId: string) => {
  return useQuery({
    queryKey: ['projectResources', projectId],
    queryFn: () => resourceService.getProjectResources(projectId),
    enabled: !!projectId,
    staleTime: 0,
  });
};

export const useAllocateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AllocateResourceData }) => 
      resourceService.allocateResourceToProject(projectId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectResources', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateResourceAllocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AllocateResourceData> }) => 
      resourceService.updateResourceAllocation(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectResources', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useRemoveResourceAllocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resourceService.removeResourceAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectResources'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Legacy hooks for backward compatibility
export const useAllResources = useResources;

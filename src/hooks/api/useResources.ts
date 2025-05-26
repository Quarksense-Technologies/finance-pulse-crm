
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService, CreateResourceData, UpdateResourceData } from '@/services/api/resourceService';

export const useResources = (projectId?: string) => {
  return useQuery({
    queryKey: ['resources', projectId],
    queryFn: () => resourceService.getResources(projectId),
    enabled: !!projectId,
    staleTime: 0, // Always refetch to ensure fresh data
    cacheTime: 0, // Don't cache stale data
  });
};

export const useAllResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => resourceService.getResources(),
    staleTime: 0, // Always refetch to ensure fresh data
    cacheTime: 0, // Don't cache stale data
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
    onSuccess: (data, variables) => {
      console.log('Resource created successfully, invalidating all caches...');
      
      // Clear all resource-related queries completely
      queryClient.removeQueries({ queryKey: ['resources'] });
      queryClient.removeQueries({ queryKey: ['resourcesSummary'] });
      queryClient.removeQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['project', variables.projectId] });
      
      // Force immediate refetch of all queries
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['resources'] });
        queryClient.refetchQueries({ queryKey: ['resourcesSummary'] });
        queryClient.refetchQueries({ queryKey: ['projects'] });
        queryClient.refetchQueries({ queryKey: ['project', variables.projectId] });
      }, 100);
      
      console.log('All caches cleared and refetch initiated');
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceData }) => 
      resourceService.updateResource(id, data),
    onSuccess: (data, variables) => {
      // Clear all resource-related queries completely
      queryClient.removeQueries({ queryKey: ['resources'] });
      queryClient.removeQueries({ queryKey: ['resourcesSummary'] });
      queryClient.removeQueries({ queryKey: ['projects'] });
      
      // Force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['resources'] });
        queryClient.refetchQueries({ queryKey: ['resourcesSummary'] });
        queryClient.refetchQueries({ queryKey: ['projects'] });
      }, 100);
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resourceService.deleteResource,
    onSuccess: () => {
      // Clear all resource-related queries completely
      queryClient.removeQueries({ queryKey: ['resources'] });
      queryClient.removeQueries({ queryKey: ['resourcesSummary'] });
      queryClient.removeQueries({ queryKey: ['projects'] });
      
      // Force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['resources'] });
        queryClient.refetchQueries({ queryKey: ['resourcesSummary'] });
        queryClient.refetchQueries({ queryKey: ['projects'] });
      }, 100);
    },
  });
};

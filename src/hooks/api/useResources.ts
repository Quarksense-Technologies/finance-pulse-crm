
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService, CreateResourceData, UpdateResourceData } from '@/services/api/resourceService';

export const useResources = (projectId?: string) => {
  return useQuery({
    queryKey: ['resources', projectId],
    queryFn: () => resourceService.getResources(projectId),
    enabled: !!projectId,
  });
};

export const useAllResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => resourceService.getResources(),
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
      console.log('Resource created successfully, invalidating caches...');
      
      // Invalidate all resource queries
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources', variables.projectId] });
      
      // Invalidate the specific project to update its resources
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Invalidate resource summary
      queryClient.invalidateQueries({ queryKey: ['resourcesSummary'] });
      
      // Force immediate refetch of all relevant queries
      queryClient.refetchQueries({ queryKey: ['resources'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
      queryClient.refetchQueries({ queryKey: ['project', variables.projectId] });
      
      console.log('Cache invalidation and refetch completed');
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
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['resourcesSummary'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['resources'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resourceService.deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['resourcesSummary'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['resources'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
    },
  });
};

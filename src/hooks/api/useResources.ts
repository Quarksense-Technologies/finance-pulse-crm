
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService, CreateResourceData, UpdateResourceData } from '@/services/api/resourceService';

export const useResources = (projectId?: string) => {
  return useQuery({
    queryKey: ['resources', { projectId }],
    queryFn: () => resourceService.getResources(projectId),
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
    mutationFn: (resourceData: CreateResourceData) => resourceService.createResource(resourceData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to update UI
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resourcesSummary'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Force refetch to ensure immediate updates
      queryClient.refetchQueries({ queryKey: ['resources'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
      queryClient.refetchQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceData }) => 
      resourceService.updateResource(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', data.id] });
      queryClient.invalidateQueries({ queryKey: ['resourcesSummary'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
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
      queryClient.invalidateQueries({ queryKey: ['resourcesSummary'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['resources'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
    },
  });
};

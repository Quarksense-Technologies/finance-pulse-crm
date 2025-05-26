
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService, ApprovalItem } from '@/services/api/approvalService';

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => approvalService.getPendingApprovals(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

export const useApproveItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) => 
      approvalService.approveItem(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
  });
};

export const useRejectItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, type, reason }: { id: string; type: string; reason: string }) => 
      approvalService.rejectItem(id, type, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
  });
};

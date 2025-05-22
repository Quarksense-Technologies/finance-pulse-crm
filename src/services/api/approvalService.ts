
import apiClient from './client';
import { toast } from "@/components/ui/use-toast";

export interface ApprovalItem {
  id: string;
  type: 'expense' | 'payment' | 'resource';
  description: string;
  amount?: number;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  projectId: string;
  projectName: string;
}

export const approvalService = {
  async getPendingApprovals(): Promise<ApprovalItem[]> {
    try {
      const response = await apiClient.get('/approvals/pending');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  },
  
  async approveItem(id: string, type: string): Promise<void> {
    try {
      await apiClient.put(`/${type}/${id}/approve`);
      toast({
        title: "Success",
        description: "Item approved successfully",
      });
    } catch (error: any) {
      console.error(`Error approving ${type} ${id}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to approve ${type}`,
        variant: "destructive"
      });
      throw error;
    }
  },
  
  async rejectItem(id: string, type: string, reason: string): Promise<void> {
    try {
      await apiClient.put(`/${type}/${id}/reject`, { reason });
      toast({
        title: "Success",
        description: "Item rejected successfully",
      });
    } catch (error: any) {
      console.error(`Error rejecting ${type} ${id}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to reject ${type}`,
        variant: "destructive"
      });
      throw error;
    }
  }
};

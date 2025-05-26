
import apiClient from './client';
import { toast } from "@/components/ui/use-toast";

export interface ApprovalItem {
  id: string;
  type: 'expense'; // Only expenses need approval
  description: string;
  amount: number;
  category?: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  projectId: string;
  projectName: string;
  project?: any;
}

export const approvalService = {
  async getPendingApprovals(): Promise<ApprovalItem[]> {
    try {
      console.log('Fetching pending approvals from API...');
      const response = await apiClient.get('/approvals/pending');
      console.log('Pending approvals response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  },
  
  async approveItem(id: string, type: string): Promise<void> {
    try {
      console.log(`Approving ${type} with ID: ${id}`);
      // Use the correct endpoint for approving expenses
      await apiClient.put(`/approvals/finances/${id}/approve`);
      toast({
        title: "Success",
        description: "Expense approved successfully",
      });
    } catch (error: any) {
      console.error(`Error approving ${type} ${id}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to approve expense`,
        variant: "destructive"
      });
      throw error;
    }
  },
  
  async rejectItem(id: string, type: string, reason: string): Promise<void> {
    try {
      console.log(`Rejecting ${type} with ID: ${id}, reason: ${reason}`);
      // Use the correct endpoint for rejecting expenses
      await apiClient.put(`/approvals/finances/${id}/reject`, { reason });
      toast({
        title: "Success",
        description: "Expense rejected successfully",
      });
    } catch (error: any) {
      console.error(`Error rejecting ${type} ${id}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to reject expense`,
        variant: "destructive"
      });
      throw error;
    }
  }
};

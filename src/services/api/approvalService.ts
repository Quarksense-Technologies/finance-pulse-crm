
import apiClient from './client';
import { toast } from "@/components/ui/use-toast";

export interface ApprovalItem {
  id: string;
  type: 'expense' | 'material_request';
  description: string;
  amount: number;
  category?: string;
  quantity?: number;
  partNo?: string;
  urgency?: string;
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
  attachments?: Array<{
    name: string;
    url: string;
  }>;
  notes?: string;
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
      
      if (type === 'material_request') {
        await apiClient.put(`/approvals/materials/${id}/approve`);
        toast({
          title: "Success",
          description: "Material request approved successfully",
        });
      } else {
        // Handle expense approval
        await apiClient.put(`/approvals/finances/${id}/approve`);
        toast({
          title: "Success",
          description: "Expense approved successfully",
        });
      }
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
      console.log(`Rejecting ${type} with ID: ${id}, reason: ${reason}`);
      
      if (type === 'material_request') {
        await apiClient.put(`/approvals/materials/${id}/reject`, { reason });
        toast({
          title: "Success",
          description: "Material request rejected successfully",
        });
      } else {
        // Handle expense rejection
        await apiClient.put(`/approvals/finances/${id}/reject`, { reason });
        toast({
          title: "Success",
          description: "Expense rejected successfully",
        });
      }
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

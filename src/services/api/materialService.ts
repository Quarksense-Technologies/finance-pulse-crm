
import apiClient from './client';
import { toast } from "@/components/ui/use-toast";

export interface MaterialRequest {
  id: string;
  projectId: string;
  projectName?: string;
  description: string;
  partNo?: string;
  quantity: number;
  estimatedCost?: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'purchased';
  requestedBy: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  rejectedBy?: {
    id: string;
    name: string;
  };
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface MaterialPurchase {
  id: string;
  projectId: string;
  projectName?: string;
  description: string;
  partNo?: string;
  hsn?: string;
  quantity: number;
  price: number;
  gst: number;
  totalAmount: number;
  vendor?: string;
  purchaseDate: string;
  invoiceNumber?: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  createdBy: {
    id: string;
    name: string;
  };
  expenseId?: string;
  createdAt: string;
}

export interface CreateMaterialRequestData {
  projectId: string;
  description: string;
  partNo?: string;
  quantity: number;
  estimatedCost?: number;
  urgency?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface CreateMaterialPurchaseData {
  projectId: string;
  description: string;
  partNo?: string;
  hsn?: string;
  quantity: number;
  price: number;
  gst?: number;
  totalAmount: number;
  vendor?: string;
  purchaseDate: string;
  invoiceNumber?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export const materialService = {
  // Material Requests
  async getMaterialRequests(filters?: { project?: string; status?: string }): Promise<MaterialRequest[]> {
    try {
      const response = await apiClient.get('/materials/requests', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching material requests:', error);
      throw error;
    }
  },

  async createMaterialRequest(data: CreateMaterialRequestData): Promise<MaterialRequest> {
    try {
      const response = await apiClient.post('/materials/requests', data);
      toast({
        title: "Success",
        description: "Material request created successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating material request:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create material request",
        variant: "destructive"
      });
      throw error;
    }
  },

  async deleteMaterialRequest(id: string): Promise<void> {
    try {
      await apiClient.delete(`/materials/requests/${id}`);
      toast({
        title: "Success",
        description: "Material request deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting material request:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete material request",
        variant: "destructive"
      });
      throw error;
    }
  },

  // Material Purchases
  async getMaterialPurchases(filters?: { project?: string }): Promise<MaterialPurchase[]> {
    try {
      const response = await apiClient.get('/materials/purchases', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching material purchases:', error);
      throw error;
    }
  },

  async createMaterialPurchase(data: CreateMaterialPurchaseData): Promise<{ purchase: MaterialPurchase; expense: any }> {
    try {
      const response = await apiClient.post('/materials/purchases', data);
      toast({
        title: "Success",
        description: "Material purchase created and expense added successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating material purchase:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create material purchase",
        variant: "destructive"
      });
      throw error;
    }
  },

  async deleteMaterialPurchase(id: string): Promise<void> {
    try {
      await apiClient.delete(`/materials/purchases/${id}`);
      toast({
        title: "Success",
        description: "Material purchase deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting material purchase:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete material purchase",
        variant: "destructive"
      });
      throw error;
    }
  }
};

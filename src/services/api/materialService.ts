
import apiClient from './client';
import { toast } from "@/hooks/use-toast";

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
    _id: string;
    name: string;
    data?: string;
    contentType: string;
    size: number;
    uploadedAt: string;
  }>;
  createdBy: {
    id: string;
    name: string;
  };
  expenseId?: string;
  createdAt: string;
}

export interface MaterialExpense {
  id: string;
  projectName?: string;
  description: string;
  amount: number;
  category: string;
  project: string;
  date: string;
  status?: string;
  approvalStatus?: string;
  attachments?: Array<{
    _id: string;
    name: string;
    data?: string;
    contentType: string;
    size: number;
    uploadedAt: string;
  }>;
  createdBy?: {
    id: string;
    name: string;
  };
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
    data: string;
    contentType: string;
    size: number;
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

  async getMaterialRequestById(id: string): Promise<MaterialRequest> {
    try {
      const response = await apiClient.get(`/materials/requests/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching material request:', error);
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

  async getMaterialPurchaseById(id: string): Promise<MaterialPurchase> {
    try {
      const response = await apiClient.get(`/materials/purchases/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching material purchase:', error);
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
  },

  // Material Expenses
  async getMaterialExpenses(filters?: { project?: string }): Promise<MaterialExpense[]> {
    try {
      const response = await apiClient.get('/materials/expenses', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching material expenses:', error);
      throw error;
    }
  },

  async getMaterialExpenseById(id: string): Promise<MaterialExpense> {
    try {
      const response = await apiClient.get(`/materials/expenses/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching material expense:', error);
      throw error;
    }
  },

  // Download Attachments
  async downloadMaterialPurchaseAttachment(purchaseId: string, attachmentId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/materials/purchases/${purchaseId}/attachments/${attachmentId}`, {
        responseType: 'blob'
      });

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'attachment';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Attachment downloaded successfully"
      });
    } catch (error: any) {
      console.error('Error downloading purchase attachment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to download attachment",
        variant: "destructive"
      });
      throw error;
    }
  },

  async downloadMaterialExpenseAttachment(expenseId: string, attachmentId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/materials/expenses/${expenseId}/attachments/${attachmentId}`, {
        responseType: 'blob'
      });

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'attachment';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Attachment downloaded successfully"
      });
    } catch (error: any) {
      console.error('Error downloading expense attachment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to download attachment",
        variant: "destructive"
      });
      throw error;
    }
  }
};

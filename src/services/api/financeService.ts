
import apiClient from './client';
import { toast } from "@/components/ui/use-toast";
import { Transaction, FinancialSummary } from '@/data/types';

export interface CreateTransactionData {
  type: 'expense' | 'payment' | 'income';
  amount: number;
  description: string;
  category?: string;
  project: string;
  date: string;
  status?: 'paid' | 'pending' | 'overdue'; // Added status field
  notes?: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

export interface FinancialChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
  }[];
}

export interface CategoryExpenseData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
  }[];
}

export interface PaymentFilter {
  project?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseFilter {
  project?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const financeService = {
  // Get all transactions with optional filters - now properly filters approved expenses
  async getTransactions(filters?: PaymentFilter): Promise<Transaction[]> {
    try {
      const response = await apiClient.get('/finances', { params: filters });
      
      // Filter out rejected and pending expenses on frontend as well for safety
      const transactions = response.data.filter((transaction: Transaction) => {
        if (transaction.type === 'expense') {
          return (transaction as any).approvalStatus === 'approved';
        }
        return true; // Include all payments and income
      });
      
      return transactions;
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get a transaction by ID
  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const response = await apiClient.get(`/finances/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  },

  // Create a transaction (updated to properly handle status for both expenses and payments)
  async createTransaction(transactionData: CreateTransactionData): Promise<Transaction> {
    try {
      const response = await apiClient.post('/finances', transactionData);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Update a transaction
  async updateTransaction(id: string, transactionData: Partial<CreateTransactionData>): Promise<Transaction> {
    try {
      const response = await apiClient.put(`/finances/${id}`, transactionData);
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating transaction ${id}:`, error);
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(id: string): Promise<void> {
    try {
      await apiClient.delete(`/finances/${id}`);
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting transaction ${id}:`, error);
      throw error;
    }
  },

  // Approve a transaction
  async approveTransaction(id: string): Promise<void> {
    try {
      await apiClient.put(`/finances/${id}/approve`);
      toast({
        title: "Success",
        description: "Transaction approved successfully",
      });
    } catch (error: any) {
      console.error(`Error approving transaction ${id}:`, error);
      throw error;
    }
  },

  // Reject a transaction
  async rejectTransaction(id: string, reason: string): Promise<void> {
    try {
      await apiClient.put(`/finances/${id}/reject`, { reason });
      toast({
        title: "Success",
        description: "Transaction rejected successfully",
      });
    } catch (error: any) {
      console.error(`Error rejecting transaction ${id}:`, error);
      throw error;
    }
  },

  // Get financial summary
  async getFinancialSummary(filters?: {
    startDate?: string;
    endDate?: string;
    company?: string;
    project?: string;
  }): Promise<FinancialSummary> {
    try {
      const response = await apiClient.get('/finances/summary', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },

  // Export transactions
  async exportTransactions(format: 'csv' | 'pdf' = 'csv', filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    try {
      const response = await apiClient.get(`/finances/export?format=${format}`, {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error exporting transactions to ${format}:`, error);
      throw error;
    }
  },

  // Get chart data
  async getChartData(): Promise<FinancialChartData> {
    try {
      const response = await apiClient.get('/finances/chart-data');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  // Get category expenses
  async getCategoryExpenses(): Promise<CategoryExpenseData> {
    try {
      const response = await apiClient.get('/finances/category-expenses');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category expenses:', error);
      throw error;
    }
  },

  // Get expense categories
  async getExpenseCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get('/finances/expense-categories');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching expense categories:', error);
      // Return default categories if API fails
      return ['equipment', 'materials', 'services', 'other'];
    }
  },
  
  // Save new expense category
  async saveExpenseCategory(category: string): Promise<void> {
    try {
      await apiClient.post('/finances/expense-categories', { category });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error: any) {
      console.error('Error saving expense category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
      throw error;
    }
  },

  // Export to Excel - Helper method for the Finances.tsx file
  exportToExcel(tab: 'payments' | 'expenses'): Promise<Blob> {
    // This passes the request to the exportTransactions method with format='csv'
    return this.exportTransactions('csv');
  },

  // Export to PDF - Helper method for the Finances.tsx file
  exportToPdf(tab: 'payments' | 'expenses'): Promise<Blob> {
    // This passes the request to the exportTransactions method with format='pdf'
    return this.exportTransactions('pdf');
  }
};

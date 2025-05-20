
import { toast } from "@/components/ui/use-toast";
import apiClient from './client';
import { Payment, Expense, FinancialSummary } from '@/data/types';

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

export const financeService = {
  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const response = await apiClient.get('/finances/summary');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching financial summary:', error);
      toast({
        title: "Error",
        description: "Failed to load financial summary",
        variant: "destructive"
      });
      throw error;
    }
  },

  async getChartData(): Promise<FinancialChartData> {
    try {
      const response = await apiClient.get('/finances/chart-data');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      toast({
        title: "Error",
        description: "Failed to load financial chart data",
        variant: "destructive"
      });
      throw error;
    }
  },

  async getCategoryExpenses(): Promise<CategoryExpenseData> {
    try {
      const response = await apiClient.get('/finances/category-expenses');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expense categories",
        variant: "destructive"
      });
      throw error;
    }
  },

  // Export functions
  async exportToExcel(dataType: 'payments' | 'expenses'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/finances/export/${dataType}/excel`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error exporting ${dataType} to Excel:`, error);
      toast({
        title: "Export Failed",
        description: `Could not export ${dataType} to Excel`,
        variant: "destructive"
      });
      throw error;
    }
  },

  async exportToPdf(dataType: 'payments' | 'expenses'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/finances/export/${dataType}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error exporting ${dataType} to PDF:`, error);
      toast({
        title: "Export Failed",
        description: `Could not export ${dataType} to PDF`,
        variant: "destructive"
      });
      throw error;
    }
  }
};


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

export interface CreateExpenseData {
  projectId: string;
  amount: number;
  date: string;
  category: string;  // Support for custom categories
  description: string;
}

export const financeService = {
  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const response = await apiClient.get('/finances/summary');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },

  async getChartData(): Promise<FinancialChartData> {
    try {
      const response = await apiClient.get('/finances/chart-data');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  async getCategoryExpenses(): Promise<CategoryExpenseData> {
    try {
      const response = await apiClient.get('/finances/category-expenses');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category expenses:', error);
      throw error;
    }
  },

  async addExpense(expense: CreateExpenseData): Promise<Expense> {
    try {
      const response = await apiClient.post(`/projects/${expense.projectId}/expenses`, expense);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding expense:', error);
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
      throw error;
    }
  }
};

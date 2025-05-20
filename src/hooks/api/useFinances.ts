
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/services/api/financeService';
import { Payment, Expense } from '@/data/types';
import { exportPaymentsToExcel, exportExpensesToExcel, exportPaymentsToPDF, exportExpensesToPDF } from '@/utils/exportUtils';

export const usePayments = (filters?: { projectId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => financeService.getPayments(filters),
  });
};

export const useExpenses = (filters?: { projectId?: string; category?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => financeService.getExpenses(filters),
  });
};

export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['financialSummary'],
    queryFn: financeService.getFinancialSummary,
  });
};

export const useFinancialChartData = () => {
  return useQuery({
    queryKey: ['financialChartData'],
    queryFn: financeService.getChartData,
  });
};

export const useCategoryExpenses = () => {
  return useQuery({
    queryKey: ['categoryExpenses'],
    queryFn: financeService.getCategoryExpenses,
  });
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expenseCategories'],
    queryFn: financeService.getExpenseCategories,
  });
};

export const useAddExpenseCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: financeService.saveExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
    },
  });
};

export const useExportPayments = () => {
  return {
    exportToExcel: (payments: Payment[], fileName?: string) => {
      return exportPaymentsToExcel(payments, fileName);
    },
    exportToPdf: (payments: Payment[], fileName?: string) => {
      return exportPaymentsToPDF(payments, fileName);
    }
  };
};

export const useExportExpenses = () => {
  return {
    exportToExcel: (expenses: Expense[], fileName?: string) => {
      return exportExpensesToExcel(expenses, fileName);
    },
    exportToPdf: (expenses: Expense[], fileName?: string) => {
      return exportExpensesToPDF(expenses, fileName);
    }
  };
};

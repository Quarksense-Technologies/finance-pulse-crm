
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService, CreateTransactionData } from '@/services/api/financeService';
import { Payment, Expense, Transaction } from '@/data/types';
import { exportPaymentsToExcel, exportExpensesToExcel, exportPaymentsToPDF, exportExpensesToPDF } from '@/utils/exportUtils';

export const useTransactions = (filters?: { project?: string; type?: string; status?: string }) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => financeService.getTransactions(filters),
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => financeService.getTransactionById(id),
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionData) => financeService.createTransaction(data),
    onSuccess: (data, variables) => {
      console.log('Transaction created successfully, invalidating caches...');
      
      // Invalidate all possible transaction query combinations
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', undefined] });
      queryClient.invalidateQueries({ queryKey: ['transactions', {}] });
      
      // Invalidate type-specific queries
      queryClient.invalidateQueries({ queryKey: ['transactions', { type: 'payment' }] });
      queryClient.invalidateQueries({ queryKey: ['transactions', { type: 'income' }] });
      queryClient.invalidateQueries({ queryKey: ['transactions', { type: 'expense' }] });
      
      // Invalidate other financial data
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['financialChartData'] });
      queryClient.invalidateQueries({ queryKey: ['categoryExpenses'] });
      
      // Invalidate project data
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.project] });
      
      // Force immediate refetch of all transaction queries
      queryClient.refetchQueries({ queryKey: ['transactions'] });
      
      console.log('Cache invalidation completed');
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) => 
      financeService.updateTransaction(id, data),
    onSuccess: (data, variables) => {
      // Invalidate all transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['financialChartData'] });
      queryClient.invalidateQueries({ queryKey: ['categoryExpenses'] });
      
      // Invalidate project data
      if (variables.data.project) {
        queryClient.invalidateQueries({ queryKey: ['project', variables.data.project] });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: financeService.deleteTransaction,
    onSuccess: () => {
      // Invalidate all transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['financialChartData'] });
      queryClient.invalidateQueries({ queryKey: ['categoryExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useApproveTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: financeService.approveTransaction,
    onSuccess: (_, id) => {
      // Invalidate all transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['financialChartData'] });
      queryClient.invalidateQueries({ queryKey: ['categoryExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useRejectTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      financeService.rejectTransaction(id, reason),
    onSuccess: (_, variables) => {
      // Invalidate all transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['financialChartData'] });
      queryClient.invalidateQueries({ queryKey: ['categoryExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useFinancialSummary = (filters?: { 
  startDate?: string; 
  endDate?: string; 
  company?: string; 
  project?: string 
}) => {
  return useQuery({
    queryKey: ['financialSummary', filters],
    queryFn: () => financeService.getFinancialSummary(filters),
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

export const useExportTransactions = () => {
  return {
    exportToFormat: (format: 'csv' | 'pdf', filters?: { startDate?: string; endDate?: string }) => {
      return financeService.exportTransactions(format, filters);
    }
  };
};

// Legacy functions for backward compatibility
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

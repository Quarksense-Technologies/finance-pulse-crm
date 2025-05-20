
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/services/api/financeService';
import { Payment, Expense } from '@/data/types';
import { exportPaymentsToExcel, exportExpensesToExcel, exportPaymentsToPDF, exportExpensesToPDF } from '@/utils/exportUtils';

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

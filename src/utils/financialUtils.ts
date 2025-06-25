
import { format } from 'date-fns';
import { Project } from '@/data/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  return format(dateObj, 'dd MMM yyyy');
};

export const formatProjectStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
};

export const getProjectStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'planning': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'paid': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
    'rejected': 'bg-red-100 text-red-800',
    'approved': 'bg-green-100 text-green-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'paid': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
    'rejected': 'bg-red-100 text-red-800',
    'approved': 'bg-green-100 text-green-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getExpenseCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'salary': 'bg-blue-100 text-blue-800',
    'equipment': 'bg-purple-100 text-purple-800',
    'software': 'bg-indigo-100 text-indigo-800',
    'consulting': 'bg-green-100 text-green-800',
    'office': 'bg-orange-100 text-orange-800',
    'travel': 'bg-cyan-100 text-cyan-800',
    'marketing': 'bg-pink-100 text-pink-800',
    'utilities': 'bg-teal-100 text-teal-800',
    'taxes': 'bg-red-100 text-red-800',
    'other': 'bg-gray-100 text-gray-800',
  };
  return colorMap[category] || 'bg-gray-100 text-gray-800';
};

// Project calculation functions
export const calculateProjectRevenue = (project: Project): number => {
  // Calculate revenue from project budget or transactions
  return project.budget || 0;
};

export const calculateProjectExpenses = (project: Project): number => {
  // Calculate expenses from project transactions or resources
  // For now, return 0 as we need to implement transaction-based calculation
  return 0;
};

export const calculateProjectNetProfit = (project: Project): number => {
  const revenue = calculateProjectRevenue(project);
  const expenses = calculateProjectExpenses(project);
  return revenue - expenses;
};

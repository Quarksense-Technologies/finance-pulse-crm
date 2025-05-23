
import { Project, Payment, Expense } from '../data/types';

// Calculate total revenue for a project
export const calculateProjectRevenue = (project: Project): number => {
  if (!project || !project.payments) return 0;
  return project.payments.reduce((sum, payment) => 
    payment.status === 'paid' ? sum + payment.amount : sum, 0);
};

// Calculate total expenses for a project
export const calculateProjectExpenses = (project: Project): number => {
  if (!project || !project.expenses) return 0;
  return project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Calculate project profit
export const calculateProjectProfit = (project: Project): number => {
  if (!project) return 0;
  const revenue = calculateProjectRevenue(project);
  const expenses = calculateProjectExpenses(project);
  return revenue - expenses;
};

// Calculate pending payments for a project
export const calculatePendingPayments = (project: Project): number => {
  if (!project || !project.payments) return 0;
  return project.payments.reduce((sum, payment) => 
    payment.status === 'pending' ? sum + payment.amount : sum, 0);
};

// Calculate overdue payments for a project
export const calculateOverduePayments = (project: Project): number => {
  if (!project || !project.payments) return 0;
  return project.payments.reduce((sum, payment) => 
    payment.status === 'overdue' ? sum + payment.amount : sum, 0);
};

// Format currency 
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get payment status color
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get project status color
export const getProjectStatusColor = (status: string): string => {
  switch (status) {
    case 'in-progress':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'planning':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get expense category color
export const getExpenseCategoryColor = (category: string): string => {
  switch (category) {
    case 'manpower':
      return 'bg-blue-100 text-blue-800';
    case 'materials':
      return 'bg-purple-100 text-purple-800';
    case 'services':
      return 'bg-indigo-100 text-indigo-800';
    case 'other':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

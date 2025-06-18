
import { Project, Payment, Expense, AttendanceRecord, ProjectResourceAllocation } from '@/data/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateProjectRevenue = (project: Project): number => {
  if (!project.payments) return 0;
  return project.payments
    .filter(payment => payment.status === 'approved' || payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
};

export const calculateProjectExpenses = (project: Project): number => {
  if (!project.expenses) return 0;
  return project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateProjectProfit = (project: Project): number => {
  const revenue = calculateProjectRevenue(project);
  const expenses = calculateProjectExpenses(project);
  return revenue - expenses;
};

// Calculate actual resource cost based on attendance records only
export const calculateResourceCostFromAttendance = (
  attendanceRecords: AttendanceRecord[],
  allocations: ProjectResourceAllocation[]
): number => {
  return attendanceRecords.reduce((sum, record) => {
    const allocation = allocations.find(a => a.resourceId === record.resourceId);
    const hourlyRate = record.hourlyRate || allocation?.resource?.hourlyRate || 0;
    return sum + (record.totalHours * hourlyRate);
  }, 0);
};

// This function should NOT include resource budget allocations
export const calculateTotalManpowerCost = (project: Project): number => {
  // Only return 0 - actual costs should come from attendance records
  // Budget allocations should not be considered as expenses
  return 0;
};

export const calculateProjectTotalExpenses = (
  project: Project,
  attendanceRecords: AttendanceRecord[] = [],
  allocations: ProjectResourceAllocation[] = []
): number => {
  const materialExpenses = calculateProjectExpenses(project);
  const resourceCosts = calculateResourceCostFromAttendance(attendanceRecords, allocations);
  return materialExpenses + resourceCosts;
};

export const calculateProjectNetProfit = (
  project: Project,
  attendanceRecords: AttendanceRecord[] = [],
  allocations: ProjectResourceAllocation[] = []
): number => {
  const revenue = calculateProjectRevenue(project);
  const totalExpenses = calculateProjectTotalExpenses(project, attendanceRecords, allocations);
  return revenue - totalExpenses;
};

// Project status utilities
export const formatProjectStatus = (status: string): string => {
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'in-progress':
      return 'In Progress';
    case 'on-hold':
      return 'On Hold';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export const getProjectStatusColor = (status: string): string => {
  switch (status) {
    case 'planning':
      return 'bg-blue-100 text-blue-800';
    case 'in-progress':
      return 'bg-green-100 text-green-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Payment status utilities
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Expense category utilities
export const getExpenseCategoryColor = (category: string): string => {
  switch (category) {
    case 'salary':
      return 'bg-blue-100 text-blue-800';
    case 'equipment':
      return 'bg-green-100 text-green-800';
    case 'software':
      return 'bg-purple-100 text-purple-800';
    case 'consulting':
      return 'bg-orange-100 text-orange-800';
    case 'office':
      return 'bg-gray-100 text-gray-800';
    case 'travel':
      return 'bg-indigo-100 text-indigo-800';
    case 'marketing':
      return 'bg-pink-100 text-pink-800';
    case 'utilities':
      return 'bg-yellow-100 text-yellow-800';
    case 'taxes':
      return 'bg-red-100 text-red-800';
    case 'other':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

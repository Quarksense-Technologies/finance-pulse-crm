
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

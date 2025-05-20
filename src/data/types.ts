export interface Company {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  projects: string[]; // Array of project IDs
}

export interface Project {
  id: string;
  name: string;
  companyId: string;
  companyName?: string; // Optional field for displaying company name
  description: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'completed' | 'on-hold';
  payments: Payment[];
  expenses: Expense[];
  manpowerAllocated: number; // Hours
  resources: Resource[]; // Added resources array
}

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdBy?: string;
  approvedBy?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  category: string; // Changed from enum to string to support custom categories
  description: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdBy?: string;
  approvedBy?: string;
}

export interface Resource {
  id: string;
  projectId: string;
  name: string;
  role: string;
  hoursAllocated: number;
  hourlyRate: number;
  startDate: string;
  endDate: string | null;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  pendingPayments: number;
  overduePayments: number;
}

export interface ManpowerSummary {
  totalAllocated: number;
  byCompany: Record<string, number>;
  byProject: Record<string, number>;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'user';
  managerId?: string; // ID of reporting manager
  createdAt: string;
}

export interface ApprovalItem {
  id: string;
  type: 'payment' | 'expense';
  itemId: string;
  requesterId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  amount: number;
  description: string;
}

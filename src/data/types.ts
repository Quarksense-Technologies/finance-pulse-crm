
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  managerId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo?: {
    email: string;
    phone: string;
    website?: string;
  };
  managers: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  companyName?: string;
  startDate: string;
  endDate?: string | null;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  budget?: number;
  manpowerAllocated?: number;
  managers: string[];
  team: string[];
  payments?: Payment[];
  expenses?: Expense[];
  resources?: ProjectResourceAllocation[];
  totalPayments?: number;
  totalExpenses?: number;
  profit?: number;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  hourlyRate: number;
  skills?: string[];
  department?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ProjectResourceAllocation {
  id: string;
  projectId: string;
  resourceId: string;
  resource?: Resource;
  project?: Project;
  hoursAllocated: number;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  date: string;
  method: string;
  reference?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  receipt?: string;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'payment' | 'income';
  amount: number;
  description: string;
  category: string;
  project?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  attachments?: Array<{
    name: string;
    url: string;
  }>;
  createdBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingApprovals: number;
}

export interface MaterialPurchase {
  id: string;
  projectId: string;
  items: MaterialPurchaseItem[];
  totalAmount: number;
  purchaseDate: string;
  vendor: string;
  invoiceNumber?: string;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  notes?: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
  createdBy?: string;
  createdAt: string;
}

export interface MaterialPurchaseItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
}

export interface MaterialRequest {
  id: string;
  projectId: string;
  items: MaterialRequestItem[];
  requestDate: string;
  requiredBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  notes?: string;
  requestedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface MaterialRequestItem {
  name: string;
  quantity: number;
  unit: string;
  specifications?: string;
  estimatedCost?: number;
}

export interface AttendanceRecord {
  id: string;
  projectResourceId: string;
  projectResource?: ProjectResourceAllocation;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  totalHours: number;
  createdBy?: string;
  createdAt?: string;
}

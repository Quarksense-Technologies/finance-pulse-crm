
import { Company, Project, Payment, Expense, FinancialSummary, ManpowerSummary, Resource } from './types';

// Mock Companies
export const companies: Company[] = [
  {
    id: 'comp-1',
    name: 'Acme Corporation',
    contactPerson: 'John Doe',
    email: 'john@acme.com',
    phone: '(555) 123-4567',
    address: '123 Business Ave, Suite 100, Business City, 12345',
    projects: ['proj-1', 'proj-2']
  },
  {
    id: 'comp-2',
    name: 'TechNova Solutions',
    contactPerson: 'Jane Smith',
    email: 'jane@technova.com',
    phone: '(555) 987-6543',
    address: '456 Innovation Blvd, Tech Park, Innovation City, 67890',
    projects: ['proj-3']
  },
  {
    id: 'comp-3',
    name: 'Global Enterprises',
    contactPerson: 'Robert Johnson',
    email: 'robert@globalent.com',
    phone: '(555) 456-7890',
    address: '789 Corporate Dr, Enterprise Zone, Metro City, 54321',
    projects: ['proj-4', 'proj-5']
  }
];

// Mock Projects
export const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    companyId: 'comp-1',
    description: 'Complete overhaul of company website with modern design and improved functionality',
    startDate: '2025-01-15',
    endDate: '2025-04-30',
    status: 'in-progress',
    payments: [],
    expenses: [],
    manpowerAllocated: 320,
    resources: []
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    companyId: 'comp-1',
    description: 'Creating a cross-platform mobile application for customer engagement',
    startDate: '2025-02-01',
    endDate: null,
    status: 'in-progress',
    payments: [],
    expenses: [],
    manpowerAllocated: 480,
    resources: []
  },
  {
    id: 'proj-3',
    name: 'Cloud Migration',
    companyId: 'comp-2',
    description: 'Migrating on-premise infrastructure to cloud services',
    startDate: '2024-11-01',
    endDate: '2025-03-15',
    status: 'completed',
    payments: [],
    expenses: [],
    manpowerAllocated: 250,
    resources: []
  },
  {
    id: 'proj-4',
    name: 'E-commerce Platform',
    companyId: 'comp-3',
    description: 'Building an e-commerce platform with inventory management',
    startDate: '2025-03-01',
    endDate: null,
    status: 'in-progress',
    payments: [],
    expenses: [],
    manpowerAllocated: 600,
    resources: []
  },
  {
    id: 'proj-5',
    name: 'Digital Marketing Campaign',
    companyId: 'comp-3',
    description: 'Comprehensive digital marketing strategy and implementation',
    startDate: '2025-02-15',
    endDate: '2025-08-15',
    status: 'on-hold',
    payments: [],
    expenses: [],
    manpowerAllocated: 180,
    resources: []
  }
];

// Mock Payments
export const payments: Payment[] = [
  {
    id: 'pay-1',
    projectId: 'proj-1',
    amount: 15000,
    date: '2025-02-01',
    status: 'paid',
    description: 'Initial payment'
  },
  {
    id: 'pay-2',
    projectId: 'proj-1',
    amount: 10000,
    date: '2025-03-15',
    status: 'paid',
    description: 'Milestone payment'
  },
  {
    id: 'pay-3',
    projectId: 'proj-1',
    amount: 25000,
    date: '2025-05-01',
    status: 'pending',
    description: 'Final payment'
  },
  {
    id: 'pay-4',
    projectId: 'proj-2',
    amount: 20000,
    date: '2025-02-15',
    status: 'paid',
    description: 'Initial payment'
  },
  {
    id: 'pay-5',
    projectId: 'proj-2',
    amount: 30000,
    date: '2025-04-15',
    status: 'overdue',
    description: 'Development milestone'
  },
  {
    id: 'pay-6',
    projectId: 'proj-3',
    amount: 45000,
    date: '2024-11-15',
    status: 'paid',
    description: 'Initial payment'
  },
  {
    id: 'pay-7',
    projectId: 'proj-3',
    amount: 35000,
    date: '2025-01-15',
    status: 'paid',
    description: 'Implementation milestone'
  },
  {
    id: 'pay-8',
    projectId: 'proj-3',
    amount: 20000,
    date: '2025-03-20',
    status: 'paid',
    description: 'Final payment'
  },
  {
    id: 'pay-9',
    projectId: 'proj-4',
    amount: 25000,
    date: '2025-03-10',
    status: 'paid',
    description: 'Initial payment'
  },
  {
    id: 'pay-10',
    projectId: 'proj-4',
    amount: 40000,
    date: '2025-05-01',
    status: 'pending',
    description: 'Development milestone'
  },
  {
    id: 'pay-11',
    projectId: 'proj-5',
    amount: 15000,
    date: '2025-02-20',
    status: 'paid',
    description: 'Initial payment'
  },
  {
    id: 'pay-12',
    projectId: 'proj-5',
    amount: 10000,
    date: '2025-04-15',
    status: 'overdue',
    description: 'Monthly retainer'
  }
];

// Mock Expenses
export const expenses: Expense[] = [
  {
    id: 'exp-1',
    projectId: 'proj-1',
    amount: 5000,
    date: '2025-01-20',
    category: 'manpower',
    description: 'Design team hours'
  },
  {
    id: 'exp-2',
    projectId: 'proj-1',
    amount: 3000,
    date: '2025-02-10',
    category: 'services',
    description: 'UX testing services'
  },
  {
    id: 'exp-3',
    projectId: 'proj-1',
    amount: 8000,
    date: '2025-03-05',
    category: 'manpower',
    description: 'Development team hours'
  },
  {
    id: 'exp-4',
    projectId: 'proj-2',
    amount: 12000,
    date: '2025-02-05',
    category: 'manpower',
    description: 'Mobile development team'
  },
  {
    id: 'exp-5',
    projectId: 'proj-2',
    amount: 2500,
    date: '2025-03-01',
    category: 'services',
    description: 'App Store submissions'
  },
  {
    id: 'exp-6',
    projectId: 'proj-3',
    amount: 20000,
    date: '2024-11-10',
    category: 'services',
    description: 'Cloud services setup'
  },
  {
    id: 'exp-7',
    projectId: 'proj-3',
    amount: 15000,
    date: '2024-12-15',
    category: 'manpower',
    description: 'Migration team hours'
  },
  {
    id: 'exp-8',
    projectId: 'proj-3',
    amount: 5000,
    date: '2025-02-01',
    category: 'services',
    description: 'Monthly cloud hosting fees'
  },
  {
    id: 'exp-9',
    projectId: 'proj-4',
    amount: 18000,
    date: '2025-03-15',
    category: 'manpower',
    description: 'Development team hours'
  },
  {
    id: 'exp-10',
    projectId: 'proj-4',
    amount: 7500,
    date: '2025-04-01',
    category: 'materials',
    description: 'Server hardware'
  },
  {
    id: 'exp-11',
    projectId: 'proj-5',
    amount: 6000,
    date: '2025-02-25',
    category: 'services',
    description: 'Ad platform fees'
  },
  {
    id: 'exp-12',
    projectId: 'proj-5',
    amount: 4000,
    date: '2025-03-15',
    category: 'manpower',
    description: 'Marketing team hours'
  }
];

// Mock Resources
export const resources: Resource[] = [
  {
    id: 'res-1',
    projectId: 'proj-1',
    name: 'Alex Johnson',
    role: 'Senior Developer',
    hoursAllocated: 120,
    hourlyRate: 75,
    startDate: '2025-01-15',
    endDate: '2025-04-30'
  },
  {
    id: 'res-2',
    projectId: 'proj-1',
    name: 'Sarah Chen',
    role: 'UI/UX Designer',
    hoursAllocated: 80,
    hourlyRate: 65,
    startDate: '2025-01-20',
    endDate: '2025-03-15'
  },
  {
    id: 'res-3',
    projectId: 'proj-2',
    name: 'Michael Rodriguez',
    role: 'Mobile Developer',
    hoursAllocated: 160,
    hourlyRate: 70,
    startDate: '2025-02-01',
    endDate: null
  },
  {
    id: 'res-4',
    projectId: 'proj-2',
    name: 'Jessica White',
    role: 'QA Engineer',
    hoursAllocated: 120,
    hourlyRate: 60,
    startDate: '2025-02-15',
    endDate: null
  },
  {
    id: 'res-5',
    projectId: 'proj-3',
    name: 'David Lee',
    role: 'Cloud Architect',
    hoursAllocated: 100,
    hourlyRate: 85,
    startDate: '2024-11-01',
    endDate: '2025-03-15'
  },
  {
    id: 'res-6',
    projectId: 'proj-4',
    name: 'Emily Clark',
    role: 'Full Stack Developer',
    hoursAllocated: 200,
    hourlyRate: 75,
    startDate: '2025-03-01',
    endDate: null
  }
];

// Associate payments, expenses and resources with projects
export const initializeData = () => {
  // Add payments to projects
  payments.forEach(payment => {
    const project = projects.find(p => p.id === payment.projectId);
    if (project) {
      project.payments.push(payment);
    }
  });

  // Add expenses to projects
  expenses.forEach(expense => {
    const project = projects.find(p => p.id === expense.projectId);
    if (project) {
      project.expenses.push(expense);
    }
  });

  // Add resources to projects
  resources.forEach(resource => {
    const project = projects.find(p => p.id === resource.projectId);
    if (project) {
      project.resources.push(resource);
    }
  });

  return {
    companies,
    projects,
    payments,
    expenses,
    resources
  };
};

// Calculate financial summary
export const calculateFinancialSummary = (): FinancialSummary => {
  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status === 'paid' ? sum + payment.amount : sum, 0);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const pendingPayments = payments.reduce((sum, payment) => 
    payment.status === 'pending' ? sum + payment.amount : sum, 0);
  
  const overduePayments = payments.reduce((sum, payment) => 
    payment.status === 'overdue' ? sum + payment.amount : sum, 0);

  return {
    totalRevenue,
    totalExpenses,
    profit: totalRevenue - totalExpenses,
    pendingPayments,
    overduePayments
  };
};

// Calculate manpower summary
export const calculateManpowerSummary = (): ManpowerSummary => {
  const totalAllocated = resources.reduce((sum, resource) => 
    sum + resource.hoursAllocated, 0);
  
  const byCompany: Record<string, number> = {};
  const byProject: Record<string, number> = {};
  
  resources.forEach(resource => {
    // Add to project summary
    if (!byProject[resource.projectId]) {
      byProject[resource.projectId] = 0;
    }
    byProject[resource.projectId] += resource.hoursAllocated;
    
    // Find project to get company ID
    const project = projects.find(p => p.id === resource.projectId);
    if (project) {
      if (!byCompany[project.companyId]) {
        byCompany[project.companyId] = 0;
      }
      byCompany[project.companyId] += resource.hoursAllocated;
    }
  });
  
  return {
    totalAllocated,
    byCompany,
    byProject
  };
};

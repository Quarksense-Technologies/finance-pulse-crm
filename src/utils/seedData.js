
/**
 * Database Seed Data
 * 
 * This file contains structured sample data that can be used to seed the database.
 * Run this file with your database connection to populate test data.
 */

const companies = [
  {
    id: "comp-1",
    name: "Acme Corporation",
    contactPerson: "John Smith",
    email: "john@acmecorp.com",
    phone: "555-123-4567",
    address: "123 Main St, New York, NY 10001"
  },
  {
    id: "comp-2",
    name: "TechVision Inc",
    contactPerson: "Sarah Johnson",
    email: "sarah@techvision.com",
    phone: "555-987-6543",
    address: "456 Innovation Way, San Francisco, CA 94103"
  },
  {
    id: "comp-3",
    name: "Global Enterprises",
    contactPerson: "Michael Brown",
    email: "michael@globalent.com",
    phone: "555-456-7890",
    address: "789 Corporate Blvd, Chicago, IL 60601"
  }
];

const projects = [
  {
    id: "proj-1",
    name: "Website Redesign",
    companyId: "comp-1",
    description: "Complete redesign of corporate website with improved UX and responsive design",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    status: "active",
    manpowerAllocated: 320
  },
  {
    id: "proj-2",
    name: "Mobile App Development",
    companyId: "comp-2",
    description: "Develop iOS and Android mobile applications for customer engagement",
    startDate: "2024-02-01",
    endDate: null,
    status: "active",
    manpowerAllocated: 480
  },
  {
    id: "proj-3",
    name: "Legacy System Migration",
    companyId: "comp-1",
    description: "Migrate legacy database systems to cloud-based solution",
    startDate: "2023-11-01",
    endDate: "2024-03-31",
    status: "completed",
    manpowerAllocated: 600
  },
  {
    id: "proj-4",
    name: "Digital Marketing Campaign",
    companyId: "comp-3",
    description: "Comprehensive digital marketing campaign across multiple platforms",
    startDate: "2024-04-01",
    endDate: "2024-07-31",
    status: "active",
    manpowerAllocated: 240
  }
];

const resources = [
  {
    id: "res-1",
    projectId: "proj-1",
    name: "David Miller",
    role: "Frontend Developer",
    hoursAllocated: 120,
    hourlyRate: 75,
    startDate: "2024-01-15",
    endDate: "2024-06-30"
  },
  {
    id: "res-2",
    projectId: "proj-1",
    name: "Emily Chen",
    role: "UX Designer",
    hoursAllocated: 80,
    hourlyRate: 85,
    startDate: "2024-01-15",
    endDate: "2024-04-15"
  },
  {
    id: "res-3",
    projectId: "proj-1",
    name: "Robert Taylor",
    role: "Project Manager",
    hoursAllocated: 60,
    hourlyRate: 95,
    startDate: "2024-01-15",
    endDate: "2024-06-30"
  },
  {
    id: "res-4",
    projectId: "proj-2",
    name: "Jessica Wong",
    role: "iOS Developer",
    hoursAllocated: 160,
    hourlyRate: 80,
    startDate: "2024-02-01",
    endDate: null
  },
  {
    id: "res-5",
    projectId: "proj-2",
    name: "Alex Martinez",
    role: "Android Developer",
    hoursAllocated: 160,
    hourlyRate: 80,
    startDate: "2024-02-01",
    endDate: null
  },
  {
    id: "res-6",
    projectId: "proj-2",
    name: "Lisa Park",
    role: "QA Specialist",
    hoursAllocated: 100,
    hourlyRate: 65,
    startDate: "2024-03-01",
    endDate: null
  },
  {
    id: "res-7",
    projectId: "proj-3",
    name: "James Wilson",
    role: "Database Architect",
    hoursAllocated: 200,
    hourlyRate: 90,
    startDate: "2023-11-01",
    endDate: "2024-03-31"
  },
  {
    id: "res-8",
    projectId: "proj-3",
    name: "Sophia Garcia",
    role: "Backend Developer",
    hoursAllocated: 180,
    hourlyRate: 75,
    startDate: "2023-11-01",
    endDate: "2024-03-31"
  },
  {
    id: "res-9",
    projectId: "proj-4",
    name: "Daniel Johnson",
    role: "Marketing Specialist",
    hoursAllocated: 120,
    hourlyRate: 70,
    startDate: "2024-04-01",
    endDate: "2024-07-31"
  },
  {
    id: "res-10",
    projectId: "proj-4",
    name: "Olivia Brown",
    role: "Content Creator",
    hoursAllocated: 80,
    hourlyRate: 65,
    startDate: "2024-04-01",
    endDate: "2024-07-31"
  }
];

const payments = [
  {
    id: "pay-1",
    projectId: "proj-1",
    amount: 15000,
    date: "2024-01-20",
    description: "Initial payment - Website Redesign",
    status: "paid"
  },
  {
    id: "pay-2",
    projectId: "proj-1",
    amount: 10000,
    date: "2024-03-15",
    description: "Milestone 1 payment - Website Redesign",
    status: "paid"
  },
  {
    id: "pay-3",
    projectId: "proj-1",
    amount: 10000,
    date: "2024-05-30",
    description: "Milestone 2 payment - Website Redesign",
    status: "pending"
  },
  {
    id: "pay-4",
    projectId: "proj-2",
    amount: 20000,
    date: "2024-02-10",
    description: "Initial payment - Mobile App Development",
    status: "paid"
  },
  {
    id: "pay-5",
    projectId: "proj-2",
    amount: 15000,
    date: "2024-04-20",
    description: "Milestone 1 payment - Mobile App Development",
    status: "overdue"
  },
  {
    id: "pay-6",
    projectId: "proj-3",
    amount: 25000,
    date: "2023-11-15",
    description: "Initial payment - Legacy System Migration",
    status: "paid"
  },
  {
    id: "pay-7",
    projectId: "proj-3",
    amount: 20000,
    date: "2024-01-31",
    description: "Milestone 1 payment - Legacy System Migration",
    status: "paid"
  },
  {
    id: "pay-8",
    projectId: "proj-3",
    amount: 20000,
    date: "2024-03-31",
    description: "Final payment - Legacy System Migration",
    status: "paid"
  },
  {
    id: "pay-9",
    projectId: "proj-4",
    amount: 12000,
    date: "2024-04-10",
    description: "Initial payment - Digital Marketing Campaign",
    status: "paid"
  },
  {
    id: "pay-10",
    projectId: "proj-4",
    amount: 8000,
    date: "2024-06-15",
    description: "Milestone 1 payment - Digital Marketing Campaign",
    status: "pending"
  }
];

const expenses = [
  {
    id: "exp-1",
    projectId: "proj-1",
    amount: 5000,
    date: "2024-01-25",
    category: "software",
    description: "Design software licenses"
  },
  {
    id: "exp-2",
    projectId: "proj-1",
    amount: 1500,
    date: "2024-02-10",
    category: "services",
    description: "Stock photography subscription"
  },
  {
    id: "exp-3",
    projectId: "proj-1",
    amount: 9000,
    date: "2024-02-28",
    category: "manpower",
    description: "Contractor payment - UX specialist"
  },
  {
    id: "exp-4",
    projectId: "proj-2",
    amount: 7500,
    date: "2024-02-15",
    category: "software",
    description: "Mobile development licenses and tools"
  },
  {
    id: "exp-5",
    projectId: "proj-2",
    amount: 3000,
    date: "2024-03-20",
    category: "services",
    description: "API integration services"
  },
  {
    id: "exp-6",
    projectId: "proj-2",
    amount: 12000,
    date: "2024-04-05",
    category: "manpower",
    description: "Contractor fees - UI specialists"
  },
  {
    id: "exp-7",
    projectId: "proj-3",
    amount: 8500,
    date: "2023-11-20",
    category: "hardware",
    description: "Server infrastructure"
  },
  {
    id: "exp-8",
    projectId: "proj-3",
    amount: 15000,
    date: "2023-12-15",
    category: "software",
    description: "Database migration tools and licenses"
  },
  {
    id: "exp-9",
    projectId: "proj-3",
    amount: 6000,
    date: "2024-01-10",
    category: "services",
    description: "Cloud infrastructure setup"
  },
  {
    id: "exp-10",
    projectId: "proj-4",
    amount: 4500,
    date: "2024-04-15",
    category: "advertising",
    description: "Social media ad spend"
  },
  {
    id: "exp-11",
    projectId: "proj-4",
    amount: 3000,
    date: "2024-05-10",
    category: "services",
    description: "SEO optimization services"
  },
  {
    id: "exp-12",
    projectId: "proj-4",
    amount: 2500,
    date: "2024-05-25",
    category: "materials",
    description: "Promotional materials"
  }
];

const expenseCategories = [
  "manpower",
  "materials",
  "software",
  "hardware",
  "services",
  "advertising",
  "travel",
  "office",
  "utilities",
  "other"
];

// Export all seed data
module.exports = {
  companies,
  projects,
  resources,
  payments,
  expenses,
  expenseCategories
};

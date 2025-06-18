
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RoleConfig {
  role: string;
  permissions: string[];
}

// Define all available permissions
export const PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
  
  // Projects
  { id: 'view_projects', name: 'View Projects', description: 'View projects list and details', category: 'Projects' },
  { id: 'create_project', name: 'Create Project', description: 'Create new projects', category: 'Projects' },
  { id: 'edit_project', name: 'Edit Project', description: 'Edit existing projects', category: 'Projects' },
  { id: 'delete_project', name: 'Delete Project', description: 'Delete projects', category: 'Projects' },
  
  // Companies
  { id: 'view_companies', name: 'View Companies', description: 'View companies list and details', category: 'Companies' },
  { id: 'create_company', name: 'Create Company', description: 'Create new companies', category: 'Companies' },
  { id: 'edit_company', name: 'Edit Company', description: 'Edit existing companies', category: 'Companies' },
  { id: 'delete_company', name: 'Delete Company', description: 'Delete companies', category: 'Companies' },
  
  // Finances
  { id: 'view_finances', name: 'View Finances', description: 'View financial data and reports', category: 'Finances' },
  { id: 'add_expense', name: 'Add Expense', description: 'Create expense entries', category: 'Finances' },
  { id: 'add_payment', name: 'Add Payment', description: 'Create payment entries', category: 'Finances' },
  { id: 'approve_transactions', name: 'Approve Transactions', description: 'Approve financial transactions', category: 'Finances' },
  { id: 'reject_transactions', name: 'Reject Transactions', description: 'Reject financial transactions', category: 'Finances' },
  
  // Materials
  { id: 'manage_materials', name: 'Manage Materials', description: 'Access materials management', category: 'Materials' },
  { id: 'create_material_request', name: 'Create Material Request', description: 'Create material requests', category: 'Materials' },
  { id: 'approve_material_request', name: 'Approve Material Request', description: 'Approve material requests', category: 'Materials' },
  { id: 'create_material_purchase', name: 'Create Material Purchase', description: 'Create material purchases', category: 'Materials' },
  { id: 'delete_materials', name: 'Delete Materials', description: 'Delete material records', category: 'Materials' },
  
  // Resources
  { id: 'view_resources', name: 'View Resources', description: 'View resource allocation and management', category: 'Resources' },
  { id: 'manage_resources', name: 'Manage Resources', description: 'Create and edit resource allocations', category: 'Resources' },
  
  // Attendance
  { id: 'view_attendance', name: 'View Attendance', description: 'View attendance records', category: 'Attendance' },
  { id: 'manage_attendance', name: 'Manage Attendance', description: 'Manage attendance records', category: 'Attendance' },
  
  // Approvals
  { id: 'view_approvals', name: 'View Approvals', description: 'View pending approvals', category: 'Approvals' },
  { id: 'process_approvals', name: 'Process Approvals', description: 'Approve or reject pending items', category: 'Approvals' },
  
  // User Management
  { id: 'view_users', name: 'View Users', description: 'View user list and details', category: 'User Management' },
  { id: 'create_user', name: 'Create User', description: 'Create new users', category: 'User Management' },
  { id: 'edit_user', name: 'Edit User', description: 'Edit user details and roles', category: 'User Management' },
  { id: 'delete_user', name: 'Delete User', description: 'Delete users', category: 'User Management' },
  
  // Settings
  { id: 'view_settings', name: 'View Settings', description: 'Access application settings', category: 'Settings' },
  { id: 'edit_settings', name: 'Edit Settings', description: 'Modify application settings', category: 'Settings' },
];

// Define role permissions configuration
export const ROLE_PERMISSIONS: RoleConfig[] = [
  {
    role: 'admin',
    permissions: PERMISSIONS.map(p => p.id) // Admin has all permissions
  },
  {
    role: 'manager',
    permissions: [
      'view_dashboard',
      'view_projects', 'create_project', 'edit_project',
      'view_companies', 'create_company', 'edit_company',
      'view_finances', 'add_expense', 'add_payment', 'approve_transactions', 'reject_transactions',
      'manage_materials', 'create_material_request', 'approve_material_request', 'create_material_purchase',
      'view_resources', 'manage_resources',
      'view_attendance', 'manage_attendance',
      'view_approvals', 'process_approvals',
      'view_users', 'create_user', 'edit_user',
      'view_settings'
    ]
  },
  {
    role: 'user',
    permissions: [
      'view_dashboard',
      'view_projects',
      'view_companies',
      'view_finances', 'add_expense',
      'manage_materials', 'create_material_request', 'create_material_purchase',
      'view_resources',
      'view_attendance',
      'view_settings'
    ]
  }
];

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: string): string[] => {
  const roleConfig = ROLE_PERMISSIONS.find(r => r.role === role);
  return roleConfig ? roleConfig.permissions : [];
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: string, permission: string): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
};

// Helper function to get permissions grouped by category
export const getPermissionsByCategory = () => {
  const grouped: { [category: string]: Permission[] } = {};
  
  PERMISSIONS.forEach(permission => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = [];
    }
    grouped[permission.category].push(permission);
  });
  
  return grouped;
};

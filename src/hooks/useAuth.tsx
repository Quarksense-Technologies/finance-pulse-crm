import * as React from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  managerId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

// Export the Permission type so it can be imported elsewhere
export type Permission = 
  | 'manage_users'
  | 'approve_transactions'
  | 'add_company'
  | 'edit_company'
  | 'add_project'
  | 'edit_project'
  | 'add_payment'
  | 'add_expense'
  | 'view_reports';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'manager123',
    role: 'manager' as const,
    managerId: '1',
  },
  {
    id: '3',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user' as const,
    managerId: '2',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.email === email && u.password === password
        );
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // Role-based permissions
    switch (user.role) {
      case 'admin':
        return true; // Admin has all permissions
      case 'manager':
        // Managers can do everything except manage users
        if (permission === 'manage_users') return false;
        return true;
      case 'user':
        // Users have limited permissions
        return [
          'add_payment',
          'add_expense',
          'view_reports',
        ].includes(permission);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

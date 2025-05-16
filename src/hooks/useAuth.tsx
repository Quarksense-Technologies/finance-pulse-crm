// src/hooks/useAuth.tsx
import * as React from 'react';
import { authService } from '@/services/api/authService';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { user, token } = await authService.login({ email, password });
      // Ensure role is correctly typed
      const typedUser: User = {
        ...user,
        role: user.role as User['role'],
      };
      setUser(typedUser);
      localStorage.setItem('user', JSON.stringify(typedUser));
      localStorage.setItem('token', token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
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

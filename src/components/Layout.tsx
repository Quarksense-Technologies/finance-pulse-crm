
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, DollarSign, Menu, X, LogOut, UserPlus, Check, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/components/ui/use-toast";
import { Permission } from '@/hooks/useAuth';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      permission: null // Everyone can see dashboard
    },
    { 
      path: '/companies', 
      name: 'Companies', 
      icon: <Users className="w-5 h-5" />,
      permission: null // Everyone can see companies
    },
    { 
      path: '/projects', 
      name: 'Projects', 
      icon: <Briefcase className="w-5 h-5" />,
      permission: null // Everyone can see projects
    },
    { 
      path: '/finances', 
      name: 'Finances', 
      icon: <DollarSign className="w-5 h-5" />,
      permission: null // Everyone can see finances
    },
    { 
      path: '/resources', 
      name: 'Manpower', 
      icon: <Users className="w-5 h-5" />,
      permission: null // Everyone can see manpower
    },
    { 
      path: '/approvals', 
      name: 'Approvals', 
      icon: <Check className="w-5 h-5" />,
      permission: 'approve_transactions' as Permission // Only managers and admins
    },
    { 
      path: '/users', 
      name: 'User Management', 
      icon: <UserPlus className="w-5 h-5" />,
      permission: 'manage_users' as Permission // Only admins
    }
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-white shadow-lg"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative z-40 md:translate-x-0 w-64 h-screen transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 md:shadow-sm flex flex-col`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Business CRM</h1>
        </div>
        
        {/* User info */}
        {user && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user.name.slice(0, 1)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <nav className="px-4 pb-4 flex-1 overflow-y-auto">
          <ul className="space-y-1 mt-4">
            {menuItems.map((item) => {
              // Check permission if required
              if (item.permission && !hasPermission(item.permission)) {
                return null;
              }
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 p-4 md:p-6 overflow-auto transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:ml-0' : ''
      } main-content`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;


import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, DollarSign, Menu, X, LogOut, UserPlus, Check, Shield, Settings } from 'lucide-react';
import { useAuth, Permission } from '@/hooks/useAuth';
import { toast } from "@/components/ui/use-toast";

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
    },
    { 
      path: '/settings', 
      name: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      permission: null // Everyone can access settings
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
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
        } fixed md:relative z-40 md:translate-x-0 ${sidebarOpen ? 'w-64' : 'w-20'} h-screen transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:shadow-sm flex flex-col`}
      >
        <div className={`p-6 flex ${!sidebarOpen && 'justify-center'}`}>
          <h1 className={`text-2xl font-bold text-primary ${!sidebarOpen && 'md:hidden'}`}>Business CRM</h1>
          {!sidebarOpen && <span className="hidden md:block text-2xl font-bold text-primary">CRM</span>}
          
          {/* Collapse toggle for desktop */}
          <button 
            className="hidden md:flex absolute right-0 top-6 mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        </div>
        
        {/* User info */}
        {user && (
          <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${!sidebarOpen && 'md:flex md:justify-center'}`}>
            <div className={`flex items-center ${!sidebarOpen && 'md:justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user.name.slice(0, 1)}
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <nav className={`px-4 pb-4 flex-1 overflow-y-auto`}>
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
                    className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-3 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Logout button - only shown in sidebar when expanded */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className={`flex-1 p-4 md:p-6 overflow-auto transition-all duration-300 ease-in-out main-content dark:bg-gray-900 dark:text-white`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

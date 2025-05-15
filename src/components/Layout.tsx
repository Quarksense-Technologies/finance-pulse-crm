
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, DollarSign, Menu, X } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      path: '/companies', 
      name: 'Companies', 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      path: '/projects', 
      name: 'Projects', 
      icon: <Briefcase className="w-5 h-5" /> 
    },
    { 
      path: '/finances', 
      name: 'Finances', 
      icon: <DollarSign className="w-5 h-5" /> 
    }
  ];

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
        } fixed md:relative z-40 md:translate-x-0 w-64 h-screen transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 md:shadow-sm`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Business CRM</h1>
        </div>
        <nav className="px-4 pb-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
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
            ))}
          </ul>
        </nav>
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

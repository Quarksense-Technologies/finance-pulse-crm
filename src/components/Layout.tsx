
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, DollarSign, LogOut, UserPlus, Check, Shield, Settings } from 'lucide-react';
import { useAuth, Permission } from '@/hooks/useAuth';
import { toast } from "@/components/ui/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      permission: null
    },
    { 
      path: '/companies', 
      name: 'Companies', 
      icon: <Users className="w-5 h-5" />,
      permission: null
    },
    { 
      path: '/projects', 
      name: 'Projects', 
      icon: <Briefcase className="w-5 h-5" />,
      permission: null
    },
    { 
      path: '/finances', 
      name: 'Finances', 
      icon: <DollarSign className="w-5 h-5" />,
      permission: null
    },
    { 
      path: '/resources', 
      name: 'Manpower', 
      icon: <Users className="w-5 h-5" />,
      permission: null
    },
    { 
      path: '/approvals', 
      name: 'Approvals', 
      icon: <Check className="w-5 h-5" />,
      permission: 'approve_transactions' as Permission
    },
    { 
      path: '/users', 
      name: 'User Management', 
      icon: <UserPlus className="w-5 h-5" />,
      permission: 'manage_users' as Permission
    },
    { 
      path: '/settings', 
      name: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      permission: null
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-sm">
                BMS
              </div>
              <h1 className="text-lg font-bold text-primary group-data-[collapsible=icon]:hidden">
                Business CRM
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* User info */}
            {user && (
              <SidebarGroup>
                <div className="flex items-center gap-3 px-2 py-2 border-b border-sidebar-border">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                    {user.name.slice(0, 1)}
                  </div>
                  <div className="group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </p>
                  </div>
                </div>
              </SidebarGroup>
            )}

            {/* Navigation Menu */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    // Check permission if required
                    if (item.permission && !hasPermission(item.permission)) {
                      return null;
                    }
                    
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                          <Link to={item.path}>
                            {item.icon}
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

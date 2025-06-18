
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { Home, Building2, Briefcase, DollarSign, Users, LogOut, Package, Clock, Menu } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Companies', href: '/companies', icon: Building2, current: location.pathname.startsWith('/companies') },
    { name: 'Projects', href: '/projects', icon: Briefcase, current: location.pathname.startsWith('/projects') },
    { name: 'Finances', href: '/finances', icon: DollarSign, current: location.pathname.startsWith('/finances') },
    { name: 'Attendance', href: '/attendance', icon: Clock, current: location.pathname.startsWith('/attendance') },
    ...(hasPermission('manage_materials') ? [{ name: 'Materials', href: '/materials', icon: Package, current: location.pathname.startsWith('/materials') || location.pathname.startsWith('/material-') }] : []),
    ...(hasPermission('manage_resources') ? [{ name: 'Resources', href: '/resources', icon: Users, current: location.pathname.startsWith('/resources') }] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border p-4">
            <h1 className="text-lg font-bold text-primary">S-gen</h1>
          </SidebarHeader>
          
          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={item.current}>
                      <Link to={item.href} className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2 flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-2 border-b bg-background px-4 sticky top-0 z-10">
            <SidebarTrigger className="md:hidden">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div className="flex-1" />
          </header>
          
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 max-w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

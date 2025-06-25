
import React, { useEffect } from 'react';
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
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Building2, Briefcase, DollarSign, Users, LogOut, Package, Clock, Menu, Settings, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Companies', href: '/companies', icon: Building2, current: location.pathname.startsWith('/companies') },
    { name: 'Projects', href: '/projects', icon: Briefcase, current: location.pathname.startsWith('/projects') },
    { name: 'Finances', href: '/finances', icon: DollarSign, current: location.pathname.startsWith('/finances') },
    { name: 'Attendance', href: '/attendance', icon: Clock, current: location.pathname.startsWith('/attendance') },
    ...(hasPermission('manage_materials') ? [{ name: 'Materials', href: '/materials', icon: Package, current: location.pathname.startsWith('/materials') || location.pathname.startsWith('/material-') }] : []),
    ...(hasPermission('manage_resources') ? [{ name: 'Resources', href: '/resources', icon: Users, current: location.pathname.startsWith('/resources') }] : []),
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex w-full bg-background safe-area-container">
      <Sidebar className="border-r border-border" collapsible={isMobile ? "offcanvas" : "icon"}>
        <SidebarHeader className="border-b border-border p-6">
          <h1 className="text-xl font-bold text-primary">S-gen</h1>
        </SidebarHeader>
        
        <SidebarContent className="px-4 py-6">
          <SidebarMenu>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.current} size="default">
                    <Link to={item.href} className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-base">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0 h-9 w-9">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center gap-2 border-b bg-background px-6 sticky top-0 z-10 safe-area-top">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex-1" />
        </header>
        
        <main className="flex-1 overflow-auto w-full safe-area-bottom">
          <div className="w-full max-w-none">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default Layout;

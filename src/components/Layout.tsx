
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
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar className="border-r border-border" collapsible={isMobile ? "offcanvas" : "icon"}>
        <SidebarHeader className="border-b border-border p-3 sm:p-4">
          <h1 className="text-base sm:text-lg font-bold text-primary">S-gen</h1>
        </SidebarHeader>
        
        <SidebarContent className="px-1 sm:px-2 py-2 sm:py-4">
          <SidebarMenu>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.current} size={isMobile ? "default" : "sm"}>
                    <Link to={item.href} className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-2 rounded-md text-sm">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-2 sm:p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-1 sm:ml-2 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
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

      <SidebarInset className="flex-1 flex flex-col">
        <header className="flex h-12 sm:h-14 items-center gap-2 border-b bg-background px-3 sm:px-4 sticky top-0 z-10">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <div className="flex-1" />
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
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

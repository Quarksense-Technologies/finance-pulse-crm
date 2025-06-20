
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Briefcase, 
  DollarSign, 
  Users, 
  Package, 
  Clock,
  TrendingUp,
  Activity,
  Palette
} from 'lucide-react';

const Index = () => {
  const { user, hasPermission } = useAuth();

  const quickActions = [
    { 
      title: 'Companies', 
      description: 'Manage company profiles', 
      href: '/companies', 
      icon: Building2,
      color: 'bg-blue-500'
    },
    { 
      title: 'Projects', 
      description: 'View and manage projects', 
      href: '/projects', 
      icon: Briefcase,
      color: 'bg-green-500'
    },
    { 
      title: 'Finances', 
      description: 'Track expenses and payments', 
      href: '/finances', 
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    { 
      title: 'Attendance', 
      description: 'Record and view attendance', 
      href: '/attendance', 
      icon: Clock,
      color: 'bg-purple-500'
    },
    ...(hasPermission('manage_materials') ? [{ 
      title: 'Materials', 
      description: 'Manage inventory and purchases', 
      href: '/materials', 
      icon: Package,
      color: 'bg-orange-500'
    }] : []),
    ...(hasPermission('manage_resources') ? [{ 
      title: 'Resources', 
      description: 'Manage team resources', 
      href: '/resources', 
      icon: Users,
      color: 'bg-indigo-500'
    }] : []),
    ...(hasPermission('admin') ? [{ 
      title: 'UI Customization', 
      description: 'Customize app appearance', 
      href: '/ui-customization', 
      icon: Palette,
      color: 'bg-pink-500'
    }] : []),
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Team Members</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div className="text-lg sm:text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base truncate">{action.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full h-8 sm:h-9 text-xs sm:text-sm" size="sm">
                    <Link to={action.href}>
                      Go to {action.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
          <CardDescription className="text-sm">Latest updates from your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="flex-1 min-w-0">New project "Office Renovation" was created</span>
              <span className="text-muted-foreground text-xs">2h ago</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Payment of $5,000 was recorded</span>
              <span className="text-muted-foreground text-xs">4h ago</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Material request submitted for review</span>
              <span className="text-muted-foreground text-xs">6h ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;

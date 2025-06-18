
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isDarkTheme, setIsDarkTheme] = useState(
    document.documentElement.classList.contains('dark')
  );

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile.newPassword !== profile.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call an API to change the password
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully.",
    });
    
    setProfile({
      ...profile,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    toast({
      title: newTheme ? "Dark Theme Enabled" : "Light Theme Enabled",
      description: `Theme has been switched to ${newTheme ? "dark" : "light"} mode.`,
    });
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 max-w-4xl px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto">
          <TabsTrigger value="profile" className="text-xs sm:text-sm flex-1 sm:flex-none">Profile</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm flex-1 sm:flex-none">Appearance</TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm flex-1 sm:flex-none">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profile Settings</CardTitle>
              <CardDescription className="text-sm">
                Update your personal information and how it appears on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-background text-foreground border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-background text-foreground border-border"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">Update Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Appearance</CardTitle>
              <CardDescription className="text-sm">
                Customize how the portal looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="dark-mode" className="text-sm font-medium">Dark Mode</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className={`h-5 w-5 ${!isDarkTheme ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Switch
                      id="dark-mode"
                      checked={isDarkTheme}
                      onCheckedChange={toggleTheme}
                    />
                    <Moon className={`h-5 w-5 ${isDarkTheme ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Account Settings</CardTitle>
              <CardDescription className="text-sm">
                Update your password and manage your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={profile.currentPassword}
                    onChange={(e) => setProfile({...profile, currentPassword: e.target.value})}
                    className="w-full bg-background text-foreground border-border"
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={profile.newPassword}
                    onChange={(e) => setProfile({...profile, newPassword: e.target.value})}
                    className="w-full bg-background text-foreground border-border"
                    placeholder="Enter your new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={profile.confirmPassword}
                    onChange={(e) => setProfile({...profile, confirmPassword: e.target.value})}
                    className="w-full bg-background text-foreground border-border"
                    placeholder="Confirm your new password"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">Change Password</Button>
              </form>
              
              <div className="pt-6 border-t border-border">
                <h3 className="text-base sm:text-lg font-medium mb-4">Danger Zone</h3>
                <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

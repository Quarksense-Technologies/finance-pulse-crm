
// src/pages/UserManagement.tsx
import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, useCreateUser } from '@/hooks/api/useUsers';
import { User } from '@/data/types';

const UserManagement = () => {
  const { hasPermission } = useAuth();
  const { data: users = [], isLoading, error } = useUsers();
  const createUserMutation = useCreateUser();
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    managerId: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords match',
        variant: 'destructive',
      });
      return;
    }

    const userData = {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role as 'admin' | 'manager' | 'user',
      managerId: newUser.role !== 'admin' && newUser.managerId ? newUser.managerId : undefined,
    };

    createUserMutation.mutate(userData, {
      onSuccess: () => {
        setNewUser({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          managerId: '',
        });
        setDialogOpen(false);
      }
    });
  };

  const getManagerName = (managerId: string) => {
    const manager = users.find(user => user.id === managerId);
    return manager ? manager.name : 'Unknown';
  };

  if (!hasPermission('manage_users')) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load users. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Add New User</Button>
          </DialogTrigger>
          <DialogContent className="form-grid-mobile max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specific permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 form-grid-mobile">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-medium">Name</Label>
                <Input 
                  id="name" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right font-medium">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right font-medium">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={newUser.confirmPassword} 
                  onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right font-medium">Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUser.role !== 'admin' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manager" className="text-right font-medium">Reporting Manager</Label>
                  <Select 
                    value={newUser.managerId} 
                    onValueChange={(value) => setNewUser({...newUser, managerId: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(user => user.role === 'admin' || user.role === 'manager')
                        .map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleAddUser} className="w-full sm:w-auto">Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">User List</CardTitle>
          <CardDescription className="text-sm">Manage all users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-mobile">
              <thead>
                <tr className="border-b bg-muted/50 font-medium">
                  <th className="py-3 px-2 sm:px-4 text-left">Name</th>
                  <th className="py-3 px-2 sm:px-4 text-left hidden sm:table-cell">Email</th>
                  <th className="py-3 px-2 sm:px-4 text-left">Role</th>
                  <th className="py-3 px-2 sm:px-4 text-left hidden md:table-cell">Manager</th>
                  <th className="py-3 px-2 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 px-2 sm:px-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">{user.email}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <Badge variant={
                        user.role === 'admin' ? 'default' : 
                        user.role === 'manager' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                      {user.managerId ? getManagerName(user.managerId) : 'None'}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right">
                      <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

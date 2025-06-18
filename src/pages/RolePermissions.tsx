
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, Download, Upload } from 'lucide-react';
import { 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  RoleConfig, 
  getPermissionsByCategory,
  Permission 
} from '@/config/rolePermissions';
import { toast } from '@/hooks/use-toast';

const RolePermissions = () => {
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(ROLE_PERMISSIONS);
  const [activeRole, setActiveRole] = useState('admin');
  
  const permissionsByCategory = getPermissionsByCategory();
  
  const handlePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setRoleConfigs(prev => prev.map(role => {
      if (role.role === roleId) {
        const newPermissions = checked 
          ? [...role.permissions, permissionId]
          : role.permissions.filter(p => p !== permissionId);
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
  };
  
  const getCurrentRoleConfig = () => {
    return roleConfigs.find(r => r.role === activeRole) || { role: activeRole, permissions: [] };
  };
  
  const saveConfiguration = () => {
    // In a real app, this would save to backend/database
    localStorage.setItem('rolePermissions', JSON.stringify(roleConfigs));
    toast({
      title: "Success",
      description: "Role permissions saved successfully"
    });
  };
  
  const exportConfiguration = () => {
    const dataStr = JSON.stringify(roleConfigs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'role-permissions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setRoleConfigs(imported);
          toast({
            title: "Success",
            description: "Configuration imported successfully"
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid configuration file",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };
  
  const currentConfig = getCurrentRoleConfig();
  
  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Role Permissions Management</h1>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              onChange={importConfiguration}
              className="hidden"
              id="import-config"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-config')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={exportConfiguration}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={saveConfiguration}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
        
        <Tabs value={activeRole} onValueChange={setActiveRole} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
          </TabsList>
          
          {roleConfigs.map(role => (
            <TabsContent key={role.role} value={role.role} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {role.role.charAt(0).toUpperCase() + role.role.slice(1)} Role
                    <Badge variant="secondary">{role.permissions.length} permissions</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissions.map((permission: Permission) => (
                          <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={`${role.role}-${permission.id}`}
                              checked={role.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(role.role, permission.id, checked as boolean)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={`${role.role}-${permission.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {permission.name}
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Configuration Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(roleConfigs, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RolePermissions;

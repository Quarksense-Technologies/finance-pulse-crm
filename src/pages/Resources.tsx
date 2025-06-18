
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, UserCheck, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useResources, useCreateResource } from '@/hooks/api/useResources';
import { formatCurrency } from '@/utils/financialUtils';
import ResourceForm from '@/components/forms/ResourceForm';
import ResourcesList from '@/components/resources/ResourcesList';

const Resources = () => {
  const { hasPermission } = useAuth();
  const [showResourceForm, setShowResourceForm] = useState(false);
  const { data: resources = [], refetch } = useResources();
  const createResourceMutation = useCreateResource();

  const handleResourceAdded = async (resourceData: any) => {
    try {
      await createResourceMutation.mutateAsync(resourceData);
      setShowResourceForm(false);
      refetch();
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  // Calculate stats from actual resources
  const totalResources = resources.filter(r => r.isActive).length;
  const activeResources = resources.filter(r => r.isActive).length;
  const averageHourlyRate = resources.length > 0 
    ? resources.reduce((sum, r) => sum + r.hourlyRate, 0) / resources.length 
    : 0;

  if (!hasPermission('manage_resources')) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resource Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their information</p>
        </div>
        <Dialog open={showResourceForm} onOpenChange={setShowResourceForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <ResourceForm 
              onSubmit={handleResourceAdded} 
              onCancel={() => setShowResourceForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Resources</h3>
                <p className="text-2xl font-semibold">{totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Resources</h3>
                <p className="text-2xl font-semibold">{activeResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Avg Hourly Rate</h3>
                <p className="text-2xl font-semibold">
                  {formatCurrency(averageHourlyRate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources List */}
      <ResourcesList />
    </div>
  );
};

export default Resources;

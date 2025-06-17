
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingCart, DollarSign, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Materials = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  if (!hasPermission('manage_materials')) {
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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Materials Management</h1>
        <p className="text-gray-600">Manage material requests, purchases, and expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/material-requests')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <List className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Material Requests</CardTitle>
                <CardDescription>Request materials for projects</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Create and manage material requests for your projects. Track approval status and urgency levels.
            </p>
            <Button variant="outline" className="w-full">
              View Requests
            </Button>
          </CardContent>
        </Card>

        {hasPermission('create_transactions') && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/material-purchases')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Material Purchases</CardTitle>
                  <CardDescription>Record material purchases</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Record material purchases and automatically create corresponding expense entries.
              </p>
              <Button variant="outline" className="w-full">
                View Purchases
              </Button>
            </CardContent>
          </Card>
        )}

        {hasPermission('add_expense') && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/material-expenses')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Material Expenses</CardTitle>
                  <CardDescription>Track material expenses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View and manage all material-related expenses across your projects.
              </p>
              <Button variant="outline" className="w-full">
                View Expenses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">--</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-sm text-gray-600">This Month Purchases</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">$--</p>
                <p className="text-sm text-gray-600">Total Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Materials;

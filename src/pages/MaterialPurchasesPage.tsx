
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Eye, ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialPurchases } from '@/hooks/api/useMaterials';
import { useNavigate } from 'react-router-dom';
import MultiItemMaterialPurchaseForm from '@/components/forms/MultiItemMaterialPurchaseForm';

const MaterialPurchasesPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: purchases = [], isLoading } = useMaterialPurchases();

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getProjectName = (project: any) => {
    if (!project) return 'Unknown Project';
    if (typeof project === 'string') return project;
    if (typeof project === 'object' && project.name) return project.name;
    return 'Unknown Project';
  };

  if (!hasPermission('add_expense')) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Purchases
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold">Add Material Purchase</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <MultiItemMaterialPurchaseForm onSubmit={() => setShowForm(false)} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="p-4 space-y-6">
        <div className="flex flex-col space-y-3 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/materials')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Materials
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Material Purchases</h1>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full lg:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Purchase
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading purchases...</p>
            </div>
          </div>
        ) : purchases.length === 0 ? (
          <Card>
            <CardHeader className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Material Purchases</CardTitle>
              <CardDescription>No material purchases have been recorded yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Material Purchases ({purchases.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full">
                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {purchases.map((purchase) => (
                    <Card key={purchase.id} className="w-full">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{purchase.description}</h4>
                              <p className="text-xs text-muted-foreground">
                                {getProjectName(purchase.project)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-red-600">
                                {formatCurrency(purchase.totalCost)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(purchase.purchaseDate)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>{getStatusBadge(purchase.status || 'pending')}</div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(purchase)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Project</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1">Actions</div>
                  </div>

                  <div className="divide-y divide-border">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4 text-sm">
                        <div className="col-span-3">
                          <div className="font-medium">{purchase.description}</div>
                        </div>
                        <div className="col-span-2">
                          {getProjectName(purchase.project)}
                        </div>
                        <div className="col-span-2 font-semibold text-red-600">
                          {formatCurrency(purchase.totalCost)}
                        </div>
                        <div className="col-span-2">
                          {getStatusBadge(purchase.status || 'pending')}
                        </div>
                        <div className="col-span-2">
                          {formatDate(purchase.purchaseDate)}
                        </div>
                        <div className="col-span-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItem(purchase)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detail View Dialog */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedItem.description}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Project</p>
                    <p className="text-sm">{getProjectName(selectedItem.project)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="text-sm">{getStatusBadge(selectedItem.status || 'pending')}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantity</p>
                    <p className="text-sm">{selectedItem.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-sm">{formatDate(selectedItem.purchaseDate)}</p>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Cost</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedItem.totalCost)}
                  </p>
                </div>

                {selectedItem.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default MaterialPurchasesPage;

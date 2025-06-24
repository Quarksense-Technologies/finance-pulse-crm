
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Trash2, Package, ShoppingCart, IndianRupee, Calendar, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialPurchases, useDeleteMaterialPurchase } from '@/hooks/api/useMaterials';
import { useProjects } from '@/hooks/api/useProjects';
import { useNavigate } from 'react-router-dom';
import MultiItemMaterialPurchaseForm from '@/components/forms/MultiItemMaterialPurchaseForm';
import { toast } from "@/hooks/use-toast";

const MaterialPurchasesPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all');

  const { data: materialPurchases = [], isLoading, error } = useMaterialPurchases();
  const { data: projects = [] } = useProjects();
  const deletePurchaseMutation = useDeleteMaterialPurchase();

  const filteredPurchases = materialPurchases.filter(purchase => {
    if (projectFilter !== 'all' && purchase.projectId !== projectFilter) return false;
    return true;
  });

  const totalPurchases = filteredPurchases.length;
  const totalAmount = filteredPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
  const thisMonthPurchases = filteredPurchases.filter(purchase => {
    const purchaseDate = new Date(purchase.purchaseDate);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
  }).length;

  const handleDeletePurchase = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material purchase?')) {
      try {
        await deletePurchaseMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Material purchase deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to delete purchase: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleViewItem = (purchase: any) => {
    navigate(`/material-purchase/${purchase.id}`);
  };

  if (!hasPermission('create_transactions')) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>Failed to load material purchases: {error instanceof Error ? error.message : 'Unknown error'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading material purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Material Purchases
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and track material purchases
          </p>
        </div>
        
        <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto shrink-0" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Purchase</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Material Purchase</DialogTitle>
            </DialogHeader>
            <MultiItemMaterialPurchaseForm onSubmit={() => setShowPurchaseForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="project" className="text-sm font-medium">Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button variant="outline" size="sm" className="w-full h-9">
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg shrink-0">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Purchases
                </h3>
                <p className="text-lg sm:text-xl font-semibold">{totalPurchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg shrink-0">
                <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Amount
                </h3>
                <p className="text-lg sm:text-xl font-semibold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg shrink-0">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  This Month
                </h3>
                <p className="text-lg sm:text-xl font-semibold">{thisMonthPurchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg shrink-0">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Avg Purchase
                </h3>
                <p className="text-lg sm:text-xl font-semibold">
                  {totalPurchases > 0 ? formatCurrency(totalAmount / totalPurchases) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases List */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Material Purchases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No material purchases found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {projectFilter !== 'all' 
                  ? 'No purchases match your current filters'
                  : 'No material purchases have been recorded yet'
                }
              </p>
              {projectFilter === 'all' && (
                <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Purchase
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Desktop Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 bg-muted/50 text-xs sm:text-sm font-medium text-muted-foreground border-b">
                  <div className="col-span-2">Description</div>
                  <div className="col-span-2">Project</div>
                  <div className="col-span-1">Part No</div>
                  <div className="col-span-1">HSN</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1">Unit Price</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-1">Vendor</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {filteredPurchases.map((purchase) => {
                    const project = projects.find(p => p.id === purchase.projectId);
                    
                    return (
                      <div key={purchase.id} className="px-3 sm:px-4 py-3 sm:py-4">
                        {/* Mobile Layout */}
                        <div className="sm:hidden space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{purchase.description}</h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {project?.name || 'Unknown Project'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-green-600">
                                {formatCurrency(purchase.totalAmount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(purchase.purchaseDate)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Part:</span>
                              <span className="ml-1">{purchase.partNo || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">HSN:</span>
                              <span className="ml-1">{purchase.hsn || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qty:</span>
                              <span className="ml-1">{purchase.quantity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Unit:</span>
                              <span className="ml-1">{formatCurrency(purchase.price)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Vendor:</span>
                              <span className="ml-1">{purchase.vendor || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewItem(purchase)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            {hasPermission('delete_materials') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePurchase(purchase.id)}
                                disabled={deletePurchaseMutation.isPending}
                                className="flex-1"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:grid grid-cols-12 gap-3 items-center text-sm">
                          <div className="col-span-2">
                            <div className="font-medium truncate">{purchase.description}</div>
                          </div>
                          <div className="col-span-2 truncate">
                            {project?.name || 'Unknown Project'}
                          </div>
                          <div className="col-span-1 truncate">
                            {purchase.partNo || 'N/A'}
                          </div>
                          <div className="col-span-1 truncate">
                            {purchase.hsn || 'N/A'}
                          </div>
                          <div className="col-span-1">
                            {purchase.quantity}
                          </div>
                          <div className="col-span-1 font-medium">
                            {formatCurrency(purchase.price)}
                          </div>
                          <div className="col-span-1 font-semibold text-green-600">
                            {formatCurrency(purchase.totalAmount)}
                          </div>
                          <div className="col-span-1 truncate">
                            {purchase.vendor || 'N/A'}
                          </div>
                          <div className="col-span-1 text-xs">
                            {formatDate(purchase.purchaseDate)}
                          </div>
                          <div className="col-span-1">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewItem(purchase)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              {hasPermission('delete_materials') && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeletePurchase(purchase.id)}
                                  disabled={deletePurchaseMutation.isPending}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialPurchasesPage;


import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Eye, Trash2, ArrowLeft, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialPurchases, useDeleteMaterialPurchase } from '@/hooks/api/useMaterials';
import { useNavigate } from 'react-router-dom';
import MultiItemMaterialPurchaseForm from '@/components/forms/MultiItemMaterialPurchaseForm';

const MaterialPurchasesPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: materialPurchases = [], isLoading } = useMaterialPurchases();
  const deletePurchaseMutation = useDeleteMaterialPurchase();

  const handleDeletePurchase = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material purchase?')) {
      try {
        await deletePurchaseMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting material purchase:', error);
      }
    }
  };

  if (!hasPermission('create_transactions')) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md mx-4">
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
      <div className="container mx-auto py-4 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Purchases</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">Create Material Purchase</h1>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <MultiItemMaterialPurchaseForm onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/materials')} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Materials</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">Material Purchases</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">New Purchase</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading purchases...</div>
      ) : materialPurchases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Material Purchases</CardTitle>
            <CardDescription>No material purchases have been recorded yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Material Purchases ({materialPurchases.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="table-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Description</TableHead>
                    <TableHead className="min-w-[120px]">Project</TableHead>
                    <TableHead className="min-w-[80px]">Part No</TableHead>
                    <TableHead className="min-w-[80px]">HSN</TableHead>
                    <TableHead className="min-w-[80px]">Quantity</TableHead>
                    <TableHead className="min-w-[100px]">Unit Price</TableHead>
                    <TableHead className="min-w-[120px]">Total Amount</TableHead>
                    <TableHead className="min-w-[100px]">Vendor</TableHead>
                    <TableHead className="min-w-[120px]">Purchase Date</TableHead>
                    <TableHead className="min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.description}</TableCell>
                      <TableCell>{purchase.projectName || 'Unknown Project'}</TableCell>
                      <TableCell>{purchase.partNo || 'N/A'}</TableCell>
                      <TableCell>{purchase.hsn || 'N/A'}</TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>{formatCurrency(purchase.price)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(purchase.totalAmount)}
                      </TableCell>
                      <TableCell>{purchase.vendor || 'N/A'}</TableCell>
                      <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItem(purchase)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission('delete_materials') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePurchase(purchase.id)}
                              disabled={deletePurchaseMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail View Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedItem.description}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project</p>
                  <p className="text-sm">{selectedItem.projectName || 'Unknown Project'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vendor</p>
                  <p className="text-sm">{selectedItem.vendor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                  <p className="text-sm">{selectedItem.invoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">GST</p>
                  <p className="text-sm">{selectedItem.gst}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Part Number</p>
                  <p className="text-sm">{selectedItem.partNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">HSN Code</p>
                  <p className="text-sm">{selectedItem.hsn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p className="text-sm">{selectedItem.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Unit Price</p>
                  <p className="text-sm">{formatCurrency(selectedItem.price)}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(selectedItem.totalAmount)}
                </p>
              </div>
              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Attachments</p>
                  <div className="flex gap-2">
                    {selectedItem.attachments.map((attachment: any, index: number) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {attachment.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MaterialPurchasesPage;

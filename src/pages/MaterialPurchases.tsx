
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Eye, Trash2, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialPurchases, useDeleteMaterialPurchase } from '@/hooks/api/useMaterials';
import MultiItemMaterialPurchaseForm from '@/components/forms/MultiItemMaterialPurchaseForm';

const MaterialPurchases = () => {
  const { hasPermission } = useAuth();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Material Purchases</h1>
        <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Material Purchase</DialogTitle>
            </DialogHeader>
            <MultiItemMaterialPurchaseForm onSubmit={() => setShowPurchaseForm(false)} />
          </DialogContent>
        </Dialog>
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
            <CardTitle>Material Purchases ({materialPurchases.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Part No</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Actions</TableHead>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItem(purchase)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {hasPermission('delete_materials') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePurchase(purchase.id)}
                            disabled={deletePurchaseMutation.isPending}
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

export default MaterialPurchases;

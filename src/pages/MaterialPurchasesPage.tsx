
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Eye, Trash2, FileText, ArrowLeft } from 'lucide-react';
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
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchases
          </Button>
          <h1 className="text-3xl font-bold">Create Material Purchase</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <MultiItemMaterialPurchaseForm onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/materials')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
          </Button>
          <h1 className="text-3xl font-bold">Material Purchases</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase
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
    </div>
  );
};

export default MaterialPurchasesPage;

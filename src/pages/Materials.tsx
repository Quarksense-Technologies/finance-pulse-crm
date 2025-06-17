
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialRequests, useMaterialPurchases, useDeleteMaterialRequest, useDeleteMaterialPurchase } from '@/hooks/api/useMaterials';
import MaterialRequestForm from '@/components/forms/MaterialRequestForm';
import MaterialPurchaseForm from '@/components/forms/MaterialPurchaseForm';

const Materials = () => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: materialRequests = [], isLoading: requestsLoading } = useMaterialRequests();
  const { data: materialPurchases = [], isLoading: purchasesLoading } = useMaterialPurchases();
  const deleteRequestMutation = useDeleteMaterialRequest();
  const deletePurchaseMutation = useDeleteMaterialPurchase();

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material request?')) {
      try {
        await deleteRequestMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting material request:', error);
      }
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material purchase?')) {
      try {
        await deletePurchaseMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting material purchase:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      purchased: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyColors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={urgencyColors[urgency] || 'bg-gray-100 text-gray-800'}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Materials Management</h1>
        <div className="flex gap-2">
          <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Materials
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Materials</DialogTitle>
              </DialogHeader>
              <MaterialRequestForm onSubmit={() => setShowRequestForm(false)} />
            </DialogContent>
          </Dialog>

          {hasPermission('create_transactions') && (
            <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Material Purchase</DialogTitle>
                </DialogHeader>
                <MaterialPurchaseForm onSubmit={() => setShowPurchaseForm(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">Material Requests ({materialRequests.length})</TabsTrigger>
          <TabsTrigger value="purchases">Material Purchases ({materialPurchases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {requestsLoading ? (
            <div className="flex justify-center items-center h-64">Loading requests...</div>
          ) : materialRequests.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Material Requests</CardTitle>
                <CardDescription>No material requests have been made yet.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {materialRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-lg">{request.description}</CardTitle>
                      <CardDescription>
                        Requested on {formatDate(request.createdAt)} by {request.requestedBy?.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgency)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Project</p>
                        <p className="text-sm">{request.projectName || 'Unknown Project'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Part No</p>
                        <p className="text-sm">{request.partNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Quantity</p>
                        <p className="text-sm">{request.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                        <p className="text-sm">{request.estimatedCost ? formatCurrency(request.estimatedCost) : 'N/A'}</p>
                      </div>
                    </div>
                    {request.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Notes</p>
                        <p className="text-sm">{request.notes}</p>
                      </div>
                    )}
                    {request.rejectionReason && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-red-500">Rejection Reason</p>
                        <p className="text-sm text-red-600">{request.rejectionReason}</p>
                      </div>
                    )}
                    <div className="flex justify-end mt-4 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItem(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {(request.requestedBy.id === user?.id || hasPermission('delete_materials')) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={deleteRequestMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          {purchasesLoading ? (
            <div className="flex justify-center items-center h-64">Loading purchases...</div>
          ) : materialPurchases.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Material Purchases</CardTitle>
                <CardDescription>No material purchases have been recorded yet.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {materialPurchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-lg">{purchase.description}</CardTitle>
                      <CardDescription>
                        Purchased on {formatDate(purchase.purchaseDate)} by {purchase.createdBy?.name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(purchase.totalAmount)}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Project</p>
                        <p className="text-sm">{purchase.projectName || 'Unknown Project'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Part No</p>
                        <p className="text-sm">{purchase.partNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">HSN</p>
                        <p className="text-sm">{purchase.hsn || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Quantity</p>
                        <p className="text-sm">{purchase.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Unit Price</p>
                        <p className="text-sm">{formatCurrency(purchase.price)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Vendor</p>
                        <p className="text-sm">{purchase.vendor || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Invoice No</p>
                        <p className="text-sm">{purchase.invoiceNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">GST</p>
                        <p className="text-sm">{purchase.gst}%</p>
                      </div>
                    </div>
                    {purchase.attachments && purchase.attachments.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Attachments</p>
                        <div className="flex gap-2">
                          {purchase.attachments.map((attachment, index) => (
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
                    <div className="flex justify-end mt-4 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItem(purchase)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {hasPermission('delete_materials') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePurchase(purchase.id)}
                          disabled={deletePurchaseMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail View Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem.description}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add detailed view content here */}
              <pre className="text-sm bg-gray-100 p-4 rounded">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Materials;

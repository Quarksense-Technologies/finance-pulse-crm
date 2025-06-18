
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialRequests, useDeleteMaterialRequest } from '@/hooks/api/useMaterials';
import { useNavigate } from 'react-router-dom';
import MultiItemMaterialRequestForm from '@/components/forms/MultiItemMaterialRequestForm';

const MaterialRequestsPage = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: materialRequests = [], isLoading } = useMaterialRequests();
  const deleteRequestMutation = useDeleteMaterialRequest();

  console.log('🔥 MaterialRequestsPage component rendered');
  console.log('🔥 Material requests data:', materialRequests);

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material request?')) {
      try {
        await deleteRequestMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting material request:', error);
      }
    }
  };

  const handleViewRequest = (request: any) => {
    console.log('🔥🔥 HANDLE VIEW REQUEST CALLED!!! 🔥🔥');
    console.log('🔥 Request object received:', request);
    console.log('🔥 Setting selectedItem:', request);
    setSelectedItem(request);
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
            <span className="hidden sm:inline">Back to Requests</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">Create Material Request</h1>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <MultiItemMaterialRequestForm onSubmit={() => setShowForm(false)} />
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
          <h1 className="text-xl sm:text-3xl font-bold">Material Requests</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">New Request</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading requests...</div>
      ) : materialRequests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Material Requests</CardTitle>
            <CardDescription>No material requests have been made yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Material Requests ({materialRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="table-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Description</TableHead>
                    <TableHead className="min-w-[120px]">Project</TableHead>
                    <TableHead className="min-w-[80px]">Part No</TableHead>
                    <TableHead className="min-w-[80px]">Quantity</TableHead>
                    <TableHead className="min-w-[100px]">Est. Cost</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[80px]">Urgency</TableHead>
                    <TableHead className="min-w-[120px]">Requested By</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialRequests.map((request, index) => {
                    console.log(`🔥 Rendering request ${index}:`, request);
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.description}</TableCell>
                        <TableCell>{request.projectName || 'Unknown Project'}</TableCell>
                        <TableCell>{request.partNo || 'N/A'}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{request.estimatedCost ? formatCurrency(request.estimatedCost) : 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                        <TableCell>{request.requestedBy?.name}</TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                console.log('🔥🔥🔥 VIEW BUTTON CLICKED!!! 🔥🔥🔥');
                                console.log('🔥 Click event:', e);
                                console.log('🔥 Event target:', e.target);
                                console.log('🔥 Event currentTarget:', e.currentTarget);
                                console.log('🔥 Request being clicked:', request);
                                e.preventDefault();
                                e.stopPropagation();
                                handleViewRequest(request);
                              }}
                              onMouseEnter={() => console.log('🔥 Mouse entered view button')}
                              onMouseLeave={() => console.log('🔥 Mouse left view button')}
                              onPointerDown={() => console.log('🔥 Pointer down on view button')}
                              onPointerUp={() => console.log('🔥 Pointer up on view button')}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(request.requestedBy.id === user?.id || hasPermission('delete_materials')) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  console.log('🔥 DELETE BUTTON CLICKED');
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteRequest(request.id);
                                }}
                                disabled={deleteRequestMutation.isPending}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project</p>
                  <p className="text-sm">{selectedItem.projectName || 'Unknown Project'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="text-sm">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Part Number</p>
                  <p className="text-sm">{selectedItem.partNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p className="text-sm">{selectedItem.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                  <p className="text-sm">{selectedItem.estimatedCost ? formatCurrency(selectedItem.estimatedCost) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Urgency</p>
                  <div className="text-sm">{getUrgencyBadge(selectedItem.urgency)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Requested By</p>
                  <p className="text-sm">{selectedItem.requestedBy?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>
              {selectedItem.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}
              {selectedItem.rejectionReason && (
                <div>
                  <p className="text-sm font-medium text-red-500">Rejection Reason</p>
                  <p className="text-sm text-red-600">{selectedItem.rejectionReason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MaterialRequestsPage;

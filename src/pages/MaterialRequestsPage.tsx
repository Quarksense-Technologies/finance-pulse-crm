
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
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

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material request?')) {
      try {
        await deleteRequestMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting material request:', error);
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

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Button>
          <h1 className="text-3xl font-bold">Create Material Request</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <MultiItemMaterialRequestForm onSubmit={() => setShowForm(false)} />
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
          <h1 className="text-3xl font-bold">Material Requests</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
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
            <CardTitle>Material Requests ({materialRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Part No</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialRequests.map((request) => (
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItem(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(request.requestedBy.id === user?.id || hasPermission('delete_materials')) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRequest(request.id)}
                            disabled={deleteRequestMutation.isPending}
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

export default MaterialRequestsPage;

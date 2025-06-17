import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Eye, FileText } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePendingApprovals, useApproveItem, useRejectItem } from '@/hooks/api/useApprovals';
import { formatCurrency, formatDate } from '@/utils/financialUtils';

const Approvals = () => {
  const { user, hasPermission } = useAuth();
  const { data: pendingApprovals = [], isLoading } = usePendingApprovals();
  const approveItemMutation = useApproveItem();
  const rejectItemMutation = useRejectItem();
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [itemToReject, setItemToReject] = useState<any>(null);

  console.log('Pending approvals data:', pendingApprovals);

  const handleApprove = async (id: string, type: string) => {
    try {
      await approveItemMutation.mutateAsync({ id, type });
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleReject = async (id: string, type: string) => {
    if (!rejectReason.trim()) {
      return;
    }
    
    try {
      await rejectItemMutation.mutateAsync({ id, type, reason: rejectReason });
      setShowRejectDialog(false);
      setRejectReason('');
      setItemToReject(null);
    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

  const openRejectDialog = (item: any) => {
    setItemToReject(item);
    setShowRejectDialog(true);
  };

  const expenseApprovals = pendingApprovals.filter(item => item.type === 'expense');
  const materialRequestApprovals = pendingApprovals.filter(item => item.type === 'material_request');

  if (!hasPermission('approve_transactions')) {
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading approvals...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Approval Requests</h1>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="expenses">Expenses ({expenseApprovals.length})</TabsTrigger>
          <TabsTrigger value="materials">Material Requests ({materialRequestApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          {expenseApprovals.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Expense Approvals</CardTitle>
                <CardDescription>All expense claims have been processed.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            expenseApprovals.map((item) => (
              <ApprovalCard 
                key={item.id} 
                item={item} 
                onApprove={handleApprove} 
                onReject={openRejectDialog}
                onViewDetails={() => setSelectedItem(item)}
                isLoading={approveItemMutation.isPending || rejectItemMutation.isPending}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="materials">
          {materialRequestApprovals.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Material Requests</CardTitle>
                <CardDescription>All material requests have been processed.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            materialRequestApprovals.map((item) => (
              <MaterialRequestCard 
                key={item.id} 
                item={item} 
                onApprove={handleApprove} 
                onReject={openRejectDialog}
                onViewDetails={() => setSelectedItem(item)}
                isLoading={approveItemMutation.isPending || rejectItemMutation.isPending}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => itemToReject && handleReject(itemToReject.id, itemToReject.type)}
              disabled={!rejectReason.trim() || rejectItemMutation.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog - Fixed alignment and positioning */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-semibold">
                {selectedItem.type === 'material_request' ? 'Material Request Details' : 'Expense Details'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Project</Label>
                  <p className="text-sm text-gray-900">{selectedItem.projectName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Requested By</Label>
                  <p className="text-sm text-gray-900">{selectedItem.createdBy.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Date</Label>
                  <p className="text-sm text-gray-900">{formatDate(selectedItem.date)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Amount</Label>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(selectedItem.amount)}</p>
                </div>
              </div>
              
              {selectedItem.type === 'material_request' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Part Number</Label>
                    <p className="text-sm text-gray-900">{selectedItem.partNo || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                    <p className="text-sm text-gray-900">{selectedItem.quantity}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Urgency</Label>
                    <div>
                      <Badge className={
                        selectedItem.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        selectedItem.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {selectedItem.urgency?.charAt(0).toUpperCase() + selectedItem.urgency?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedItem.description}</p>
              </div>

              {selectedItem.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedItem.notes}</p>
                </div>
              )}

              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Attachments</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.attachments.map((attachment: any, index: number) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="h-8"
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

interface ApprovalCardProps {
  item: any;
  onApprove: (id: string, type: string) => void;
  onReject: (item: any) => void;
  onViewDetails: () => void;
  isLoading: boolean;
}

const ApprovalCard = ({ item, onApprove, onReject, onViewDetails, isLoading }: ApprovalCardProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>
            Expense Claim - {formatCurrency(item.amount)}
          </CardTitle>
          <CardDescription>
            Requested on {formatDate(item.createdAt || item.date)} by {item.createdBy?.name || 'Unknown User'}
          </CardDescription>
        </div>
        <StatusBadge status={item.status || 'pending'} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <p className="text-sm">{item.description}</p>
            {item.category && (
              <p className="text-sm text-gray-500 mt-1">Category: {item.category}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Project: {item.projectName || 'Unknown Project'}
            </p>
          </div>
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={onViewDetails}
              >
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => onApprove(item.id, item.type)}
                disabled={isLoading}
              >
                <Check className="w-4 h-4" /> Approve
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => onReject(item)}
                disabled={isLoading}
              >
                <X className="w-4 h-4" /> Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MaterialRequestCard = ({ item, onApprove, onReject, onViewDetails, isLoading }: ApprovalCardProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>
            Material Request - {item.description}
          </CardTitle>
          <CardDescription>
            Requested on {formatDate(item.createdAt)} by {item.createdBy?.name || 'Unknown User'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status || 'pending'} />
          {item.urgency && (
            <Badge className={
              item.urgency === 'high' ? 'bg-red-100 text-red-800' :
              item.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }>
              {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <p className="text-sm">{item.description}</p>
            {item.partNo && (
              <p className="text-sm text-gray-500 mt-1">Part No: {item.partNo}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
            <p className="text-sm text-gray-500 mt-1">
              Project: {item.projectName || 'Unknown Project'}
            </p>
            {item.amount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Estimated Cost: {formatCurrency(item.amount)}
              </p>
            )}
          </div>
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={onViewDetails}
              >
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => onApprove(item.id, item.type)}
                disabled={isLoading}
              >
                <Check className="w-4 h-4" /> Approve
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => onReject(item)}
                disabled={isLoading}
              >
                <X className="w-4 h-4" /> Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Approvals;

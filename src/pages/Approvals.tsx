
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading approvals...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Approval Requests</h1>
        <p className="text-gray-600 mt-2">Review and approve pending requests</p>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
          <TabsTrigger value="expenses" className="text-sm">
            Expenses ({expenseApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-sm">
            Material Requests ({materialRequestApprovals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {expenseApprovals.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <CardTitle className="text-xl text-gray-600">No Pending Expense Approvals</CardTitle>
                <CardDescription>All expense claims have been processed.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {expenseApprovals.map((item) => (
                <ApprovalCard 
                  key={item.id} 
                  item={item} 
                  onApprove={handleApprove} 
                  onReject={openRejectDialog}
                  onViewDetails={() => {
                    console.log('🔥 VIEW DETAILS CLICKED - EXPENSE:', item);
                    setSelectedItem(item);
                  }}
                  isLoading={approveItemMutation.isPending || rejectItemMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {materialRequestApprovals.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <CardTitle className="text-xl text-gray-600">No Pending Material Requests</CardTitle>
                <CardDescription>All material requests have been processed.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {materialRequestApprovals.map((item) => (
                <MaterialRequestCard 
                  key={item.id} 
                  item={item} 
                  onApprove={handleApprove} 
                  onReject={openRejectDialog}
                  onViewDetails={() => {
                    console.log('🔥 VIEW DETAILS CLICKED - MATERIAL REQUEST:', item);
                    setSelectedItem(item);
                  }}
                  isLoading={approveItemMutation.isPending || rejectItemMutation.isPending}
                />
              ))}
            </div>
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

      {/* Detail View Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b">
              <DialogTitle className="text-xl font-semibold">
                {selectedItem.type === 'material_request' ? 'Material Request Details' : 'Expense Details'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Project</Label>
                  <p className="text-sm text-gray-900 font-medium">{selectedItem.projectName}</p>
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
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedItem.amount)}</p>
                </div>
              </div>
              
              {selectedItem.type === 'material_request' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
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

              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md border">
                  {selectedItem.description}
                </div>
              </div>

              {selectedItem.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md border">
                    {selectedItem.notes}
                  </div>
                </div>
              )}

              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Attachments</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedItem.attachments.map((attachment: any, index: number) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="h-auto p-3 justify-start"
                      >
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{attachment.name}</span>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              Expense Claim - {formatCurrency(item.amount)}
            </CardTitle>
            <CardDescription className="mt-1">
              Requested on {formatDate(item.createdAt || item.date)} by {item.createdBy?.name || 'Unknown User'}
            </CardDescription>
          </div>
          <StatusBadge status={item.status || 'pending'} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <p className="text-sm text-gray-700 mb-2">{item.description}</p>
            {item.category && (
              <p className="text-xs text-gray-500">Category: {item.category}</p>
            )}
            <p className="text-xs text-gray-500">
              Project: {item.projectName || 'Unknown Project'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <Button 
              size="sm"
              variant="outline"
              onClick={(e) => {
                console.log('🔥 EXPENSE VIEW BUTTON CLICKED:', e);
                onViewDetails();
              }}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" /> View
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-green-600 hover:text-green-700"
              onClick={() => onApprove(item.id, item.type)}
              disabled={isLoading}
            >
              <Check className="w-4 h-4" /> Approve
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
              onClick={() => onReject(item)}
              disabled={isLoading}
            >
              <X className="w-4 h-4" /> Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MaterialRequestCard = ({ item, onApprove, onReject, onViewDetails, isLoading }: ApprovalCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              Material Request - {item.description}
            </CardTitle>
            <CardDescription className="mt-1">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <p className="text-sm text-gray-700 mb-2">{item.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              {item.partNo && <p>Part No: {item.partNo}</p>}
              <p>Quantity: {item.quantity}</p>
              <p className="col-span-2">Project: {item.projectName || 'Unknown Project'}</p>
              {item.amount > 0 && (
                <p className="col-span-2">Estimated Cost: {formatCurrency(item.amount)}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <Button 
              size="sm"
              variant="outline"
              onClick={(e) => {
                console.log('🔥 MATERIAL REQUEST VIEW BUTTON CLICKED:', e);
                onViewDetails();
              }}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" /> View
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-green-600 hover:text-green-700"
              onClick={() => onApprove(item.id, item.type)}
              disabled={isLoading}
            >
              <Check className="w-4 h-4" /> Approve
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
              onClick={() => onReject(item)}
              disabled={isLoading}
            >
              <X className="w-4 h-4" /> Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Approvals;

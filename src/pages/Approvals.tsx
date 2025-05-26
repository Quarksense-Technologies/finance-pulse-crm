
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Check, X } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePendingApprovals, useApproveItem, useRejectItem } from '@/hooks/api/useApprovals';
import { formatCurrency, formatDate } from '@/utils/financialUtils';

const Approvals = () => {
  const { user, hasPermission } = useAuth();
  const { data: pendingApprovals = [], isLoading } = usePendingApprovals();
  const approveItemMutation = useApproveItem();
  const rejectItemMutation = useRejectItem();

  const handleApprove = async (id: string, type: string) => {
    try {
      await approveItemMutation.mutateAsync({ id, type });
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleReject = async (id: string, type: string) => {
    try {
      await rejectItemMutation.mutateAsync({ id, type, reason: 'Rejected by manager' });
    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

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

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-1 mb-6">
          <TabsTrigger value="pending">Pending ({pendingApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Approvals</CardTitle>
                <CardDescription>All approval requests have been processed.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            pendingApprovals.map((item) => (
              <ApprovalCard 
                key={item.id} 
                item={item} 
                onApprove={handleApprove} 
                onReject={handleReject}
                isLoading={approveItemMutation.isPending || rejectItemMutation.isPending}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ApprovalCardProps {
  item: any;
  onApprove: (id: string, type: string) => void;
  onReject: (id: string, type: string) => void;
  isLoading: boolean;
}

const ApprovalCard = ({ item, onApprove, onReject, isLoading }: ApprovalCardProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>
            {item.type === 'payment' ? 'Payment Request' : 'Expense Claim'} - {formatCurrency(item.amount)}
          </CardTitle>
          <CardDescription>
            Requested on {formatDate(item.createdAt || item.date)} by {item.createdBy?.name || 'Unknown User'}
          </CardDescription>
        </div>
        <StatusBadge status={item.approvalStatus || 'pending'} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <p className="text-sm">{item.description}</p>
            <p className="text-sm text-gray-500 mt-1">Project: {item.project?.name || 'Unknown Project'}</p>
          </div>
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
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
                onClick={() => onReject(item.id, item.type)}
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

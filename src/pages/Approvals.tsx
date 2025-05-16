
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Check, X } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { ApprovalItem } from '@/data/types';

const Approvals = () => {
  const { user, hasPermission } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: '1',
      type: 'payment',
      itemId: 'p1',
      requesterId: '3',
      requestDate: '2025-05-10',
      status: 'pending',
      amount: 1500,
      description: 'Monthly payment for Project Alpha',
    },
    {
      id: '2',
      type: 'expense',
      itemId: 'e1',
      requesterId: '3',
      requestDate: '2025-05-11',
      status: 'pending',
      amount: 350,
      description: 'Materials for Project Beta',
    },
    {
      id: '3',
      type: 'expense',
      itemId: 'e2',
      requesterId: '3',
      requestDate: '2025-05-12',
      status: 'approved',
      amount: 120,
      description: 'Travel expenses',
      notes: 'Approved as per policy',
    },
  ]);

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(item => 
      item.id === id ? { ...item, status: 'approved', notes: 'Approved by manager' } : item
    ));
    toast({
      title: 'Request approved',
      description: 'The request has been approved successfully',
    });
  };

  const handleReject = (id: string) => {
    setApprovals(approvals.map(item => 
      item.id === id ? { ...item, status: 'rejected', notes: 'Rejected by manager' } : item
    ));
    toast({
      title: 'Request rejected',
      description: 'The request has been rejected',
      variant: 'destructive',
    });
  };

  // Filter for pending items
  const pendingApprovals = approvals.filter(item => item.status === 'pending');
  const approvedItems = approvals.filter(item => item.status === 'approved');
  const rejectedItems = approvals.filter(item => item.status === 'rejected');

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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Approval Requests</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">Pending ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedItems.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedItems.length})</TabsTrigger>
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
                showActions={true} 
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedItems.map((item) => (
            <ApprovalCard 
              key={item.id} 
              item={item} 
              onApprove={handleApprove} 
              onReject={handleReject} 
              showActions={false} 
            />
          ))}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedItems.map((item) => (
            <ApprovalCard 
              key={item.id} 
              item={item} 
              onApprove={handleApprove} 
              onReject={handleReject} 
              showActions={false} 
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ApprovalCardProps {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  showActions: boolean;
}

const ApprovalCard = ({ item, onApprove, onReject, showActions }: ApprovalCardProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>
            {item.type === 'payment' ? 'Payment Request' : 'Expense Claim'} - ₹{item.amount}
          </CardTitle>
          <CardDescription>
            Requested on {new Date(item.requestDate).toLocaleDateString()}
          </CardDescription>
        </div>
        <StatusBadge status={item.status} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <p className="text-sm">{item.description}</p>
            {item.notes && (
              <div className="mt-2">
                <p className="text-sm font-semibold">Notes:</p>
                <p className="text-sm">{item.notes}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end items-center">
            {showActions && (
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => onApprove(item.id)}
                >
                  <Check className="w-4 h-4" /> Approve
                </Button>
                <Button 
                  size="sm"
                  variant="destructive"
                  className="flex items-center gap-1"
                  onClick={() => onReject(item.id)}
                >
                  <X className="w-4 h-4" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Approvals;

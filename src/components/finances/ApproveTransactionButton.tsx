
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useApproveTransaction, useRejectTransaction } from '@/hooks/api/useFinances';
import { toast } from "@/hooks/use-toast";

interface ApproveTransactionButtonProps {
  transactionId: string;
  onActionCompleted: () => void;
}

const ApproveTransactionButton: React.FC<ApproveTransactionButtonProps> = ({ 
  transactionId, 
  onActionCompleted 
}) => {
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const approveTransactionMutation = useApproveTransaction();
  const rejectTransactionMutation = useRejectTransaction();
  
  const handleApprove = async () => {
    setIsProcessing(true);
    
    try {
      await approveTransactionMutation.mutateAsync(transactionId);
      
      toast({
        title: "Transaction approved",
        description: "The transaction has been approved successfully"
      });
      
      onActionCompleted();
    } catch (error) {
      console.error('Failed to approve transaction:', error);
      toast({
        title: "Approval failed",
        description: "There was an error approving the transaction",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await rejectTransactionMutation.mutateAsync({
        id: transactionId,
        reason: rejectionReason
      });
      
      toast({
        title: "Transaction rejected",
        description: "The transaction has been rejected"
      });
      
      setIsRejectionDialogOpen(false);
      onActionCompleted();
    } catch (error) {
      console.error('Failed to reject transaction:', error);
      toast({
        title: "Rejection failed",
        description: "There was an error rejecting the transaction",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="flex space-x-2">
      <Button
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        size="sm"
        onClick={handleApprove}
        disabled={isProcessing}
      >
        <Check className="h-4 w-4 mr-2" />
        Approve
      </Button>
      
      <AlertDialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsRejectionDialogOpen(true)}
          disabled={isProcessing}
        >
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this transaction. This information will be visible to the transaction creator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Textarea
            placeholder="Enter reason for rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRejectionDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApproveTransactionButton;

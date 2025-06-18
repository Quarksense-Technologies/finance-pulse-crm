
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialExpenseById } from '@/hooks/api/useMaterials';
import { toast } from "@/hooks/use-toast";

const MaterialExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const { data: expense, isLoading, error } = useMaterialExpenseById(id || '');

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      if (!attachment || !attachment.url) {
        toast({
          title: "Error",
          description: "Attachment URL not found",
          variant: "destructive"
        });
        return;
      }

      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name || 'attachment';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Attachment download started"
      });
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast({
        title: "Error",
        description: `Failed to download attachment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  if (!hasPermission('add_expense')) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">Loading expense details...</div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <Button variant="outline" onClick={() => navigate('/material-expenses')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Material Expenses
          </Button>
          <Card className="min-h-[60vh] flex items-center justify-center">
            <CardHeader className="text-center">
              <CardTitle>Expense Not Found</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <Button variant="outline" onClick={() => navigate('/material-expenses')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Material Expenses
        </Button>

        <Card className="min-h-[70vh]">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{expense.description}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Project</p>
                <p className="text-base">{expense.projectName || 'Unknown Project'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="text-base">{getStatusBadge(expense.approvalStatus || 'pending')}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p className="text-base">{expense.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-base">{formatDate(expense.date)}</p>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Amount</h3>
              <p className="text-4xl font-bold text-red-600">
                {formatCurrency(expense.amount)}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Attachments</h3>
              {expense.attachments && expense.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expense.attachments.map((attachment: any, index: number) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <FileText className="w-6 h-6 text-gray-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {attachment.name || `Attachment ${index + 1}`}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="ml-2 flex-shrink-0"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No attachments available</p>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaterialExpenseDetail;

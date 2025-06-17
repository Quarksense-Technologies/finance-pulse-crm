
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialPurchases } from '@/hooks/api/useMaterials';
import { toast } from "@/hooks/use-toast";

const MaterialPurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const { data: materialPurchases = [], isLoading, error } = useMaterialPurchases();
  const purchase = materialPurchases.find(p => p.id === id);

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

      if (attachment.url.startsWith('data:')) {
        // For base64 data URLs, create a download link
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For regular URLs, open in new tab for download
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name || 'attachment';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

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

  if (!hasPermission('create_transactions')) {
    return (
      <div className="flex items-center justify-center h-full">
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
      <div className="flex justify-center items-center h-64">Loading purchase details...</div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => navigate('/material-purchases')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Material Purchases
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Purchase Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="outline" onClick={() => navigate('/material-purchases')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Material Purchases
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{purchase.description}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Project</p>
              <p className="text-sm">{purchase.projectName || 'Unknown Project'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Vendor</p>
              <p className="text-sm">{purchase.vendor || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Invoice Number</p>
              <p className="text-sm">{purchase.invoiceNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">GST</p>
              <p className="text-sm">{purchase.gst}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Part Number</p>
              <p className="text-sm">{purchase.partNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">HSN Code</p>
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
            <div>
              <p className="text-sm font-medium text-gray-500">Purchase Date</p>
              <p className="text-sm">{formatDate(purchase.purchaseDate)}</p>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
            <p className="text-4xl font-bold text-green-600">
              {formatCurrency(purchase.totalAmount)}
            </p>
          </div>

          {purchase.attachments && purchase.attachments.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Attachments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {purchase.attachments.map((attachment: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium">
                          {attachment.name || `Attachment ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                        className="ml-2"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Attachments</h3>
              <p className="text-gray-500">No attachments available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialPurchaseDetail;

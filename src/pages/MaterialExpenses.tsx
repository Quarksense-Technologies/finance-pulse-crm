
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Eye, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useTransactions } from '@/hooks/api/useFinances';
import MultiItemMaterialExpenseForm from '@/components/forms/MultiItemMaterialExpenseForm';

const MaterialExpenses = () => {
  const { hasPermission } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Filter transactions to show only material expenses
  const { data: transactions = [], isLoading } = useTransactions({ 
    type: 'expense' 
  });

  // Filter to show only material-related expenses based on description or category
  const materialExpenses = transactions.filter(transaction => 
    transaction.description?.toLowerCase().includes('material') ||
    transaction.category === 'materials'
  );

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

  const getProjectName = (project: any) => {
    if (!project) return 'Unknown Project';
    if (typeof project === 'string') return project;
    if (typeof project === 'object' && project.name) return project.name;
    return 'Unknown Project';
  };

  const handleViewAttachment = (attachment: any) => {
    console.log('Viewing attachment:', attachment);
    try {
      if (attachment.url) {
        if (attachment.url.startsWith('data:')) {
          // For base64 data URLs, create a new window to display
          const newWindow = window.open();
          if (newWindow) {
            if (attachment.type && attachment.type.startsWith('image/')) {
              newWindow.document.write(`
                <html>
                  <head><title>${attachment.name}</title></head>
                  <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
                    <img src="${attachment.url}" alt="${attachment.name}" style="max-width: 100%; height: auto;" />
                  </body>
                </html>
              `);
              newWindow.document.close();
            } else {
              // For PDFs and other files, try to display directly
              newWindow.location.href = attachment.url;
            }
          }
        } else {
          // For regular URLs, open in new tab
          window.open(attachment.url, '_blank');
        }
      } else {
        console.error('No URL found for attachment:', attachment);
      }
    } catch (error) {
      console.error('Error opening attachment:', error);
    }
  };

  const handleViewItem = (transaction: any) => {
    console.log('Selected transaction:', transaction);
    setSelectedItem(transaction);
  };

  if (!hasPermission('add_expense')) {
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
        <h1 className="text-3xl font-bold">Material Expenses</h1>
        <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          {showExpenseForm && (
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Material Expense</DialogTitle>
              </DialogHeader>
              <MultiItemMaterialExpenseForm onSubmit={() => setShowExpenseForm(false)} />
            </DialogContent>
          )}
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading expenses...</div>
      ) : materialExpenses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Material Expenses</CardTitle>
            <CardDescription>No material expenses have been recorded yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Material Expenses ({materialExpenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialExpenses.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{getProjectName(transaction.project)}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status || 'pending')}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewItem(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail View Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="pr-8">
              <DialogTitle>{selectedItem.description}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project</p>
                  <p className="text-sm">{getProjectName(selectedItem.project)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="text-sm">{getStatusBadge(selectedItem.status || 'pending')}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm">{formatDate(selectedItem.date)}</p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Amount</h3>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(selectedItem.amount)}
                </p>
              </div>
              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Attachments</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedItem.attachments.map((attachment: any, index: number) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAttachment(attachment)}
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

export default MaterialExpenses;


import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Eye, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useTransactions } from '@/hooks/api/useFinances';
import { useNavigate } from 'react-router-dom';
import MultiItemMaterialExpenseForm from '@/components/forms/MultiItemMaterialExpenseForm';

const MaterialExpensesPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
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

  if (!hasPermission('add_expense')) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
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
      <div className="w-full max-w-full overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Expenses
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold">Add Material Expense</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <MultiItemMaterialExpenseForm onSubmit={() => setShowForm(false)} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="p-4 space-y-6">
        <div className="flex flex-col space-y-3 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/materials')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Materials
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Material Expenses</h1>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full lg:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading expenses...</p>
            </div>
          </div>
        ) : materialExpenses.length === 0 ? (
          <Card>
            <CardHeader className="text-center py-12">
              <CardTitle>No Material Expenses</CardTitle>
              <CardDescription>No material expenses have been recorded yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Material Expenses ({materialExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full">
                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {materialExpenses.map((transaction) => (
                    <Card key={transaction.id} className="w-full">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{transaction.description}</h4>
                              <p className="text-xs text-muted-foreground">
                                {getProjectName(transaction.project)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-red-600">
                                {formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(transaction.date)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>{getStatusBadge(transaction.status || 'pending')}</div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(transaction)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Project</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1">Actions</div>
                  </div>

                  <div className="divide-y divide-border">
                    {materialExpenses.map((transaction) => (
                      <div key={transaction.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4 text-sm">
                        <div className="col-span-3">
                          <div className="font-medium">{transaction.description}</div>
                        </div>
                        <div className="col-span-2">
                          {getProjectName(transaction.project)}
                        </div>
                        <div className="col-span-2 font-semibold text-red-600">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="col-span-2">
                          {getStatusBadge(transaction.status || 'pending')}
                        </div>
                        <div className="col-span-2">
                          {formatDate(transaction.date)}
                        </div>
                        <div className="col-span-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItem(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detail View Dialog */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedItem.description}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedItem.amount)}
                  </p>
                </div>

                {selectedItem.attachments && selectedItem.attachments.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedItem.attachments.map((attachment: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-sm font-medium truncate">
                                {attachment.name || `Attachment ${index + 1}`}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = attachment.url;
                                link.download = attachment.name || `attachment-${index + 1}`;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
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
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default MaterialExpensesPage;

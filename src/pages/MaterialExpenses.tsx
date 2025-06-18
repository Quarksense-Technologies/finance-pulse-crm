
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useMaterialExpenses } from '@/hooks/api/useMaterials';
import { useNavigate } from 'react-router-dom';
import MultiItemMaterialExpenseForm from '@/components/forms/MultiItemMaterialExpenseForm';

const MaterialExpenses = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Use the new dedicated material expenses endpoint
  const { data: materialExpenses = [], isLoading, error } = useMaterialExpenses();

  console.log('🔥 MaterialExpenses component rendered');
  console.log('🔥 Material expenses data:', materialExpenses);

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

  const handleViewItem = (expense: any) => {
    console.log('🔥🔥 HANDLE VIEW ITEM CALLED!!! 🔥🔥');
    console.log('🔥 Expense object received:', expense);
    setSelectedItem(expense);
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>Failed to load material expenses: {error instanceof Error ? error.message : 'Unknown error'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Material Expenses</h1>
          <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
            <Button onClick={() => setShowExpenseForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
            {showExpenseForm && (
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <Card className="min-h-[60vh] flex items-center justify-center">
            <CardHeader className="text-center">
              <CardTitle>No Material Expenses</CardTitle>
              <CardDescription>No material expenses have been recorded yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="min-h-[70vh]">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Material Expenses ({materialExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                      <TableHead className="min-w-[150px]">Project</TableHead>
                      <TableHead className="min-w-[120px]">Amount</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Date</TableHead>
                      <TableHead className="min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialExpenses.map((expense, index) => {
                      console.log(`🔥 Rendering expense ${index}:`, expense);
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>{expense.projectName || 'Unknown Project'}</TableCell>
                          <TableCell className="font-semibold text-red-600">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(expense.approvalStatus || 'pending')}</TableCell>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                console.log('🔥🔥🔥 BUTTON CLICKED!!! 🔥🔥🔥');
                                console.log('🔥 Click event:', e);
                                console.log('🔥 Expense being clicked:', expense);
                                e.preventDefault();
                                e.stopPropagation();
                                handleViewItem(expense);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detail View Dialog */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pr-8">
                <DialogTitle className="text-lg font-semibold">{selectedItem.description}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Project</p>
                    <p className="text-sm">{selectedItem.projectName || 'Unknown Project'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="text-sm">{getStatusBadge(selectedItem.approvalStatus || 'pending')}</div>
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

                {selectedItem.attachments && selectedItem.attachments.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedItem.attachments.map((attachment: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
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
                              className="ml-2"
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

export default MaterialExpenses;

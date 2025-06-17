
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Eye, FileText, ArrowLeft } from 'lucide-react';
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

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Expenses
          </Button>
          <h1 className="text-3xl font-bold">Add Material Expense</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <MultiItemMaterialExpenseForm onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/materials')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
          </Button>
          <h1 className="text-3xl font-bold">Material Expenses</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
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
                    <TableCell>{transaction.project || 'Unknown Project'}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status || 'pending')}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItem(transaction)}
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
    </div>
  );
};

export default MaterialExpensesPage;

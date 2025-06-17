
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useTransactions } from '@/hooks/api/useFinances';
import { useNavigate } from 'react-router-dom';
import MultiItemMaterialExpenseForm from '@/components/forms/MultiItemMaterialExpenseForm';

const MaterialExpenses = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Filter transactions to show only material expenses
  const { data: transactions = [], isLoading, error } = useTransactions({ 
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

  const handleViewItem = (transaction: any) => {
    navigate(`/material-expense/${transaction.id}`);
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Material Expenses</h1>
        <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Material Expense</DialogTitle>
            </DialogHeader>
            <MultiItemMaterialExpenseForm onSubmit={() => setShowExpenseForm(false)} />
          </DialogContent>
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
    </div>
  );
};

export default MaterialExpenses;

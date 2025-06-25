
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Calendar, Search, Plus, ArrowDown, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { formatCurrency, formatDate, getPaymentStatusColor, getExpenseCategoryColor } from '@/utils/financialUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import PaymentForm from '@/components/forms/PaymentForm';
import ExpenseForm from '@/components/forms/ExpenseForm';
import { useCompanies } from '@/hooks/api/useCompanies';
import { useProjects } from '@/hooks/api/useProjects';
import { useTransactions, useExportTransactions } from '@/hooks/api/useFinances';
import { Transaction } from '@/data/types';

// Color constants for charts
const PAYMENT_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const EXPENSE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

const Finances = () => {
  const [tab, setTab] = useState<'payments' | 'expenses'>('payments');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [transactionsTab, setTransactionsTab] = useState<'charts' | 'transactions'>('charts');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: allTransactions = [], isLoading, refetch } = useTransactions();
  const { exportToFormat } = useExportTransactions();

  console.log('Finances - All data loaded:', {
    transactions: allTransactions.length,
    projects: projects.length,
    companies: companies.length
  });

  // Create lookup maps for better performance
  const projectLookup = useMemo(() => {
    const lookup = new Map();
    projects.forEach(project => {
      if (project.id) {
        lookup.set(project.id, project);
        lookup.set(project.id.toString(), project);
      }
    });
    console.log('Project lookup created with', lookup.size, 'entries');
    return lookup;
  }, [projects]);

  const companyLookup = useMemo(() => {
    const lookup = new Map();
    companies.forEach(company => {
      if (company.id) {
        lookup.set(company.id, company);
        lookup.set(company.id.toString(), company);
      }
    });
    return lookup;
  }, [companies]);

  // Filter out rejected expenses and get approved transactions
  const approvedTransactions = allTransactions.filter(t => {
    if (t.type === 'expense') {
      return (t as any).approvalStatus === 'approved';
    }
    return true; // Include all payments and income
  });

  const payments = approvedTransactions.filter(t => t.type === 'payment' || t.type === 'income');
  const expenses = approvedTransactions.filter(t => t.type === 'expense');

  console.log('Filtered transactions:', { payments: payments.length, expenses: expenses.length });

  // Chart data calculations
  const paymentStatusData = useMemo(() => {
    const statusCounts = payments.reduce((acc, payment) => {
      const status = (payment as any).status || 'pending';
      acc[status] = (acc[status] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, amount]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: amount
    }));
  }, [payments]);

  const expenseCategoryData = useMemo(() => {
    const categoryCounts = expenses.reduce((acc, expense) => {
      const category = (expense as any).category || 'other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));
  }, [expenses]);

  // Company chart data - Fixed to use correct property names
  const companyChartData = useMemo(() => {
    return companies.map(company => {
      console.log(`Processing company: ${company.name} (ID: ${company.id})`);
      
      // Get projects for this company - Fixed to use companyId
      const companyProjects = projects.filter(p => 
        p.companyId === company.id || 
        String(p.companyId) === String(company.id)
      );
      
      console.log(`Company ${company.name} has ${companyProjects.length} projects`);
      
      // Get project IDs
      const projectIds = companyProjects.map(p => p.id);
      
      if (tab === 'payments') {
        const totalPayments = payments
          .filter(p => projectIds.includes(p.project))
          .filter(p => (p as any).status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingPayments = payments
          .filter(p => projectIds.includes(p.project))
          .filter(p => (p as any).status === 'pending' || (p as any).status === 'overdue')
          .reduce((sum, p) => sum + p.amount, 0);
        
        console.log(`Company ${company.name}: received=${totalPayments}, pending=${pendingPayments}`);
        
        return {
          name: company.name.length > 6 ? company.name.substring(0, 6) + '...' : company.name,
          fullName: company.name,
          received: totalPayments,
          pending: pendingPayments
        };
      } else {
        const totalExpenses = expenses
          .filter(e => projectIds.includes(e.project))
          .reduce((sum, e) => sum + e.amount, 0);
        
        console.log(`Company ${company.name}: expenses=${totalExpenses}`);
        
        return {
          name: company.name.length > 6 ? company.name.substring(0, 6) + '...' : company.name,
          fullName: company.name,
          expenses: totalExpenses
        };
      }
    }).filter(data => {
      // Only show companies with actual data
      if (tab === 'payments') {
        return data.received > 0 || data.pending > 0;
      } else {
        return data.expenses > 0;
      }
    });
  }, [companies, projects, payments, expenses, tab]);

  // Helper functions - Fixed to properly handle project data
  const getProjectName = (projectId: any): string => {
    if (!projectId) return 'No Project';
    
    // Handle if projectId is already a string
    const id = typeof projectId === 'string' ? projectId : projectId.toString();
    const project = projectLookup.get(id);
    
    if (project?.name) {
      return project.name;
    }
    
    // Fallback to truncated ID if project not found
    return `Project ${id.substring(0, 8)}...`;
  };
  
  const getProjectCompany = (projectId: any): string => {
    if (!projectId) return 'No Company';
    
    // Handle if projectId is already a string
    const id = typeof projectId === 'string' ? projectId : projectId.toString();
    const project = projectLookup.get(id);
    
    if (!project) return 'Unknown Company';
    
    const company = companyLookup.get(String(project.companyId));
    return company?.name || 'Unknown Company';
  };

  // Early return if loading
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-4 sm:p-6 space-y-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Financial Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading transaction data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePaymentSubmit = () => {
    toast({
      title: "Payment Added",
      description: "Payment has been recorded successfully.",
    });
    setIsPaymentDialogOpen(false);
    refetch();
  };

  const handleExpenseSubmit = () => {
    toast({
      title: "Expense Added", 
      description: "Expense has been recorded successfully.",
    });
    setIsExpenseDialogOpen(false);
    refetch();
  };

  // Export functions
  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await exportToFormat('csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tab}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToPdf = async () => {
    try {
      setIsExporting(true);
      const blob = await exportToFormat('pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tab}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter transactions based on search query
  const filteredPayments = searchQuery.trim() === '' 
    ? payments 
    : payments.filter((payment: Transaction) => 
        getProjectName(payment.project).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getProjectCompany(payment.project).toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredExpenses = searchQuery.trim() === '' 
    ? expenses 
    : expenses.filter((expense: Transaction) => 
        getProjectName(expense.project).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getProjectCompany(expense.project).toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Financial Management</h1>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Payment</DialogTitle>
                  <DialogDescription>
                    Record a new payment for a project.
                  </DialogDescription>
                </DialogHeader>
                <PaymentForm onSubmit={handlePaymentSubmit} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm flex-1 sm:flex-none">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Record a new expense for a project.
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm onSubmit={handleExpenseSubmit} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Main tabs */}
        <Tabs value={transactionsTab} onValueChange={(value) => setTransactionsTab(value as 'charts' | 'transactions')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="charts" className="text-xs sm:text-sm">Charts & Summary</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">All Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-4 sm:space-y-6">
            {/* Filter tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              <button
                className={`pb-2 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'payments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setTab('payments')}
              >
                Payments ({payments.length})
              </button>
              <button
                className={`pb-2 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'expenses'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setTab('expenses')}
              >
                Expenses ({expenses.length})
              </button>
            </div>
            
            {/* Charts - Enhanced mobile responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-card shadow-sm rounded-lg p-4 sm:p-6 border border-border">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">
                  {tab === 'payments' ? 'Payment Status' : 'Expense Categories'}
                </h2>
                <div className="h-48 sm:h-60 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tab === 'payments' ? paymentStatusData : expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="70%"
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(tab === 'payments' ? paymentStatusData : expenseCategoryData).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={tab === 'payments' ? PAYMENT_COLORS[index % PAYMENT_COLORS.length] : EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))} 
                        contentStyle={{ fontSize: '10px' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '9px' }}
                        iconSize={6}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-card shadow-sm rounded-lg p-4 sm:p-6 border border-border">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">By Company</h2>
                <div className="h-48 sm:h-60 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={companyChartData}
                      margin={{
                        top: 5,
                        right: 15,
                        left: 10,
                        bottom: 25,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={8}
                        tick={{ fontSize: 8 }}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis fontSize={8} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullName || label;
                        }}
                        contentStyle={{ fontSize: '10px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '9px' }} />
                      {tab === 'payments' ? (
                        <>
                          <Bar dataKey="received" fill="#10b981" name="Received" />
                          <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                        </>
                      ) : (
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recent transactions table - Enhanced mobile responsive */}
            <div className="bg-card shadow-sm rounded-lg border border-border overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-border">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
                  {tab === 'payments' ? 'Recent Payments' : 'Recent Expenses'}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <div className="min-w-[500px] sm:min-w-[600px]">
                  <table className="w-full">
                    <thead className="bg-muted text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Project</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Company</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Description</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Date</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Amount</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">{tab === 'payments' ? 'Status' : 'Category'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tab === 'payments' ? (
                        payments.slice(0, 5).map((payment: Transaction) => (
                          <tr key={payment.id} className="hover:bg-muted/50">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{getProjectName(payment.project)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{getProjectCompany(payment.project)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{payment.description}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatDate(payment.date)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <StatusBadge 
                                status={(payment as any).status || 'pending'} 
                                colorClassName={getPaymentStatusColor((payment as any).status || 'pending')} 
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        expenses.slice(0, 5).map((expense: Transaction) => (
                          <tr key={expense.id} className="hover:bg-muted/50">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{getProjectName(expense.project)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{getProjectCompany(expense.project)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{expense.description}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatDate(expense.date)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">{formatCurrency(expense.amount)}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <StatusBadge 
                                status={(expense as any).category || 'other'} 
                                colorClassName={getExpenseCategoryColor((expense as any).category || 'other')} 
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <div className="bg-card rounded-lg shadow-sm border border-border">
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <h2 className="text-base sm:text-lg font-semibold">All Transactions</h2>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <div className="relative min-w-[150px] sm:min-w-[200px]">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      </div>
                      <Input
                        placeholder="Search transactions..."
                        className="pl-8 sm:pl-10 bg-background border-border text-xs sm:text-sm h-8 sm:h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="payments" onValueChange={(val) => setTab(val as 'payments' | 'expenses')}>
                        <SelectTrigger className="w-[120px] sm:w-[150px] bg-background border-border text-xs sm:text-sm h-8 sm:h-9">
                          <SelectValue placeholder="Transaction type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payments">Payments</SelectItem>
                          <SelectItem value="expenses">Expenses</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Export dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={isExporting} className="border-border text-xs sm:text-sm h-8 sm:h-9">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {isExporting ? 'Exporting...' : 'Export'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleExportToExcel}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export to Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleExportToPdf}>
                            <FileText className="h-4 w-4 mr-2" />
                            Export to PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <div className="min-w-[600px] sm:min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px] sm:w-[100px] text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Project</TableHead>
                        <TableHead className="text-xs sm:text-sm">Company</TableHead>
                        <TableHead className="text-xs sm:text-sm">Description</TableHead>
                        <TableHead className="w-[100px] sm:w-[120px] text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="w-[80px] sm:w-[100px] text-xs sm:text-sm">{tab === 'payments' ? 'Status' : 'Category'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tab === 'payments' ? (
                        filteredPayments.map((payment: Transaction) => (
                          <TableRow key={payment.id}>
                            <TableCell className="text-xs sm:text-sm">{formatDate(payment.date)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{getProjectName(payment.project)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{getProjectCompany(payment.project)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{payment.description}</TableCell>
                            <TableCell className="text-xs sm:text-sm font-medium">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              <StatusBadge 
                                status={(payment as any).status || 'pending'} 
                                colorClassName={getPaymentStatusColor((payment as any).status || 'pending')} 
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        filteredExpenses.map((expense: Transaction) => (
                          <TableRow key={expense.id}>
                            <TableCell className="text-xs sm:text-sm">{formatDate(expense.date)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{getProjectName(expense.project)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{getProjectCompany(expense.project)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{expense.description}</TableCell>
                            <TableCell className="text-xs sm:text-sm font-medium">{formatCurrency(expense.amount)}</TableCell>
                            <TableCell>
                              <StatusBadge 
                                status={(expense as any).category || 'other'} 
                                colorClassName={getExpenseCategoryColor((expense as any).category || 'other')} 
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Finances;

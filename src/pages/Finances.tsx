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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          name: company.name.length > 4 ? company.name.substring(0, 4) + '...' : company.name,
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
          name: company.name.length > 4 ? company.name.substring(0, 4) + '...' : company.name,
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
  const getProjectName = (projectField: any): string => {
    if (!projectField) return 'No Project';
    
    // If projectField is an object with name, use it directly
    if (typeof projectField === 'object' && projectField.name) {
      return projectField.name;
    }
    
    // Extract ID from object or use as string
    let projectId = projectField;
    if (typeof projectField === 'object') {
      projectId = projectField._id || projectField.id || projectField;
    }
    
    // Convert to string and lookup
    const id = String(projectId);
    const project = projectLookup.get(id);
    
    if (project?.name) {
      return project.name;
    }
    
    // Debug logging
    console.log(`Project not found for ID: ${id}`, { 
      original: projectField,
      available: Array.from(projectLookup.keys()),
      lookup: projectLookup 
    });
    
    return `Unknown Project (${id})`;
  };
  
  const getProjectCompany = (projectField: any): string => {
    if (!projectField) return 'No Company';
    
    // If projectField is an object, check for direct company reference
    if (typeof projectField === 'object' && projectField.company) {
      if (typeof projectField.company === 'object' && projectField.company.name) {
        return projectField.company.name;
      }
    }
    
    // Extract project ID from object or use as string
    let projectId = projectField;
    if (typeof projectField === 'object') {
      projectId = projectField._id || projectField.id || projectField;
    }
    
    // Convert to string and lookup project
    const id = String(projectId);
    const project = projectLookup.get(id);
    
    if (!project) {
      console.log(`Project not found for company lookup, ID: ${id}`, {
        original: projectField
      });
      return 'Unknown Company';
    }
    
    // Handle different company reference formats
    let companyId = project.companyId;
    
    // If companyId is an object, extract the ID
    if (typeof companyId === 'object' && companyId) {
      companyId = (companyId as any)._id || (companyId as any).id || companyId;
    }
    
    const company = companyLookup.get(String(companyId));
    
    if (company?.name) {
      return company.name;
    }
    
    // Debug logging
    console.log(`Company not found for project ${id}`, { 
      projectCompanyId: companyId,
      availableCompanies: Array.from(companyLookup.keys()),
      project
    });
    
    return project.companyName || 'Unknown Company';
  };

  // Early return if loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="space-y-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Financial Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm sm:text-base">Loading transaction data...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Financial Management</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
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
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm">
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
          
          <TabsContent value="charts" className="space-y-4 lg:space-y-6">
            {/* Filter tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              <button
                className={`pb-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'payments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setTab('payments')}
              >
                Payments ({payments.length})
              </button>
              <button
                className={`pb-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'expenses'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setTab('expenses')}
              >
                Expenses ({expenses.length})
              </button>
            </div>
            
            {/* Charts - Mobile responsive grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <Card className="p-3 sm:p-4 lg:p-6">
                <CardHeader className="p-0 pb-3 sm:pb-4">
                  <CardTitle className="text-sm sm:text-base lg:text-lg">
                    {tab === 'payments' ? 'Payment Status' : 'Expense Categories'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-40 sm:h-48 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tab === 'payments' ? paymentStatusData : expenseCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="60%"
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
                          wrapperStyle={{ fontSize: '8px' }}
                          iconSize={4}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-3 sm:p-4 lg:p-6">
                <CardHeader className="p-0 pb-3 sm:pb-4">
                  <CardTitle className="text-sm sm:text-base lg:text-lg">By Company</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-40 sm:h-48 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={companyChartData}
                        margin={{
                          top: 5,
                          right: 10,
                          left: 5,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          fontSize={7}
                          tick={{ fontSize: 7 }}
                          angle={-45}
                          textAnchor="end"
                          height={30}
                        />
                        <YAxis fontSize={7} />
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                          labelFormatter={(label, payload) => {
                            const item = payload?.[0]?.payload;
                            return item?.fullName || label;
                          }}
                          contentStyle={{ fontSize: '9px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '8px' }} />
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
                </CardContent>
              </Card>
            </div>
            
            {/* Recent transactions - Mobile responsive cards */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  {tab === 'payments' ? 'Recent Payments' : 'Recent Expenses'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Mobile Cards View */}
                <div className="block lg:hidden">
                  {(tab === 'payments' ? payments : expenses).slice(0, 5).map((transaction: Transaction) => (
                    <div key={transaction.id} className="p-3 border-b border-border last:border-b-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{getProjectName(transaction.project)}</p>
                            <p className="text-xs text-muted-foreground truncate">{getProjectCompany(transaction.project)}</p>
                          </div>
                          <p className="text-sm font-semibold ml-2">{formatCurrency(transaction.amount)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                          <StatusBadge 
                            status={tab === 'payments' ? ((transaction as any).status || 'pending') : ((transaction as any).category || 'other')} 
                            colorClassName={tab === 'payments' ? getPaymentStatusColor((transaction as any).status || 'pending') : getExpenseCategoryColor((transaction as any).category || 'other')} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Project</TableHead>
                        <TableHead className="w-[120px]">Company</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead className="w-[100px]">Amount</TableHead>
                        <TableHead className="w-[100px]">{tab === 'payments' ? 'Status' : 'Category'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tab === 'payments' ? payments : expenses).slice(0, 5).map((transaction: Transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-xs">{getProjectName(transaction.project)}</TableCell>
                          <TableCell className="text-xs">{getProjectCompany(transaction.project)}</TableCell>
                          <TableCell className="text-xs">{transaction.description}</TableCell>
                          <TableCell className="text-xs">{formatDate(transaction.date)}</TableCell>
                          <TableCell className="text-xs font-medium">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={tab === 'payments' ? ((transaction as any).status || 'pending') : ((transaction as any).category || 'other')} 
                              colorClassName={tab === 'payments' ? getPaymentStatusColor((transaction as any).status || 'pending') : getExpenseCategoryColor((transaction as any).category || 'other')} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <CardTitle className="text-base sm:text-lg">All Transactions</CardTitle>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <div className="relative min-w-0 flex-1 sm:min-w-[150px] sm:flex-none">
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
                        <SelectTrigger className="w-[100px] sm:w-[120px] bg-background border-border text-xs sm:text-sm h-8 sm:h-9">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payments">Payments</SelectItem>
                          <SelectItem value="expenses">Expenses</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={isExporting} className="border-border text-xs sm:text-sm h-8 sm:h-9">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Export
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
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Mobile Cards View */}
                <div className="block lg:hidden p-3">
                  {(tab === 'payments' ? filteredPayments : filteredExpenses).map((transaction: Transaction) => (
                    <div key={transaction.id} className="p-3 border border-border rounded-lg mb-3 last:mb-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{getProjectName(transaction.project)}</p>
                            <p className="text-xs text-muted-foreground truncate">{getProjectCompany(transaction.project)}</p>
                          </div>
                          <p className="text-sm font-semibold ml-2">{formatCurrency(transaction.amount)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                          <StatusBadge 
                            status={tab === 'payments' ? ((transaction as any).status || 'pending') : ((transaction as any).category || 'other')} 
                            colorClassName={tab === 'payments' ? getPaymentStatusColor((transaction as any).status || 'pending') : getExpenseCategoryColor((transaction as any).category || 'other')} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Date</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Amount</TableHead>
                        <TableHead className="w-[100px]">{tab === 'payments' ? 'Status' : 'Category'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tab === 'payments' ? filteredPayments : filteredExpenses).map((transaction: Transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-xs">{formatDate(transaction.date)}</TableCell>
                          <TableCell className="text-xs">{getProjectName(transaction.project)}</TableCell>
                          <TableCell className="text-xs">{getProjectCompany(transaction.project)}</TableCell>
                          <TableCell className="text-xs">{transaction.description}</TableCell>
                          <TableCell className="text-xs font-medium">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={tab === 'payments' ? ((transaction as any).status || 'pending') : ((transaction as any).category || 'other')} 
                              colorClassName={tab === 'payments' ? getPaymentStatusColor((transaction as any).status || 'pending') : getExpenseCategoryColor((transaction as any).category || 'other')} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Finances;

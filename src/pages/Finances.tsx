
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
  
  // Use separate queries for better cache management
  const { data: allTransactions = [], isLoading, refetch } = useTransactions();
  const { exportToFormat } = useExportTransactions();

  console.log('All transactions loaded:', allTransactions.length);
  console.log('Projects loaded:', projects.length);
  console.log('Companies loaded:', companies.length);
  console.log('Sample transaction:', allTransactions[0]);
  console.log('Sample project:', projects[0]);

  // Create lookup maps for better performance
  const projectLookup = useMemo(() => {
    const lookup = new Map();
    projects.forEach(project => {
      if (project.id) {
        lookup.set(project.id, project);
        lookup.set(project.id.toString(), project);
      }
    });
    console.log('Project lookup map created:', lookup.size, 'entries');
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
    console.log('Company lookup map created:', lookup.size, 'entries');
    return lookup;
  }, [companies]);

  // Filter transactions by type - using real API data
  const payments = allTransactions.filter(t => t.type === 'payment' || t.type === 'income');
  const expenses = allTransactions.filter(t => t.type === 'expense');

  console.log('Payments:', payments.length, 'Expenses:', expenses.length);

  // Early return if loading
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Financial Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading transaction data...</div>
        </div>
      </div>
    );
  }

  // Prepare data for payment status pie chart using real data
  const paidAmount = payments.filter(p => (p as any).status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => (p as any).status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments.filter(p => (p as any).status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  
  const paymentStatusData = [
    { name: 'Paid', value: paidAmount, label: `Paid: ${formatCurrency(paidAmount)}` },
    { name: 'Pending', value: pendingAmount, label: `Pending: ${formatCurrency(pendingAmount)}` },
    { name: 'Overdue', value: overdueAmount, label: `Overdue: ${formatCurrency(overdueAmount)}` }
  ].filter(item => item.value > 0);
  
  // Prepare data for expense categories pie chart using real data
  const salaryExpenses = expenses.filter(e => (e as any).category === 'salary').reduce((sum, e) => sum + e.amount, 0);
  const equipmentExpenses = expenses.filter(e => (e as any).category === 'equipment').reduce((sum, e) => sum + e.amount, 0);
  const consultingExpenses = expenses.filter(e => (e as any).category === 'consulting').reduce((sum, e) => sum + e.amount, 0);
  const softwareExpenses = expenses.filter(e => (e as any).category === 'software').reduce((sum, e) => sum + e.amount, 0);
  const officeExpenses = expenses.filter(e => (e as any).category === 'office').reduce((sum, e) => sum + e.amount, 0);
  const travelExpenses = expenses.filter(e => (e as any).category === 'travel').reduce((sum, e) => sum + e.amount, 0);
  const marketingExpenses = expenses.filter(e => (e as any).category === 'marketing').reduce((sum, e) => sum + e.amount, 0);
  const utilitiesExpenses = expenses.filter(e => (e as any).category === 'utilities').reduce((sum, e) => sum + e.amount, 0);
  const taxesExpenses = expenses.filter(e => (e as any).category === 'taxes').reduce((sum, e) => sum + e.amount, 0);
  const otherExpenses = expenses.filter(e => (e as any).category === 'other' || !(e as any).category).reduce((sum, e) => sum + e.amount, 0);
  
  const expenseCategoryData = [
    { name: 'Salary', value: salaryExpenses, label: `Salary: ${formatCurrency(salaryExpenses)}` },
    { name: 'Equipment', value: equipmentExpenses, label: `Equipment: ${formatCurrency(equipmentExpenses)}` },
    { name: 'Consulting', value: consultingExpenses, label: `Consulting: ${formatCurrency(consultingExpenses)}` },
    { name: 'Software', value: softwareExpenses, label: `Software: ${formatCurrency(softwareExpenses)}` },
    { name: 'Office', value: officeExpenses, label: `Office: ${formatCurrency(officeExpenses)}` },
    { name: 'Travel', value: travelExpenses, label: `Travel: ${formatCurrency(travelExpenses)}` },
    { name: 'Marketing', value: marketingExpenses, label: `Marketing: ${formatCurrency(marketingExpenses)}` },
    { name: 'Utilities', value: utilitiesExpenses, label: `Utilities: ${formatCurrency(utilitiesExpenses)}` },
    { name: 'Taxes', value: taxesExpenses, label: `Taxes: ${formatCurrency(taxesExpenses)}` },
    { name: 'Other', value: otherExpenses, label: `Other: ${formatCurrency(otherExpenses)}` }
  ].filter(item => item.value > 0);
  
  const PAYMENT_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const EXPENSE_COLORS = ['#3b82f6', '#8b5cf6', '#6366f1', '#9ca3af', '#10b981', '#f59e0b', '#ef4444', '#8dd1e1', '#d084d0', '#ffb347'];

  // Fixed project/company name resolution with proper type checking
  const getProjectName = (projectId: string | undefined | null): string => {
    if (!projectId) {
      console.log('No project ID provided');
      return 'No Project';
    }
    
    // Ensure projectId is a string
    const projectIdStr = typeof projectId === 'string' ? projectId : String(projectId);
    
    const project = projectLookup.get(projectIdStr);
    if (project && project.name) {
      console.log(`Found project: ${project.name} for ID: ${projectIdStr}`);
      return project.name;
    }
    
    console.log(`Project not found for ID: ${projectIdStr}`);
    return `Project ${projectIdStr.length > 8 ? projectIdStr.substring(0, 8) + '...' : projectIdStr}`;
  };
  
  const getProjectCompany = (projectId: string | undefined | null): string => {
    if (!projectId) {
      console.log('No project ID provided for company lookup');
      return 'No Company';
    }
    
    // Ensure projectId is a string
    const projectIdStr = typeof projectId === 'string' ? projectId : String(projectId);
    
    const project = projectLookup.get(projectIdStr);
    if (!project) {
      console.log(`Project not found for company lookup: ${projectIdStr}`);
      return 'Unknown Company';
    }
    
    // First try to get company name directly from project
    if (project.companyName && project.companyName !== 'Unknown Company') {
      console.log(`Found company name from project: ${project.companyName}`);
      return project.companyName;
    }
    
    // Fallback to company lookup
    if (project.companyId) {
      const companyIdStr = typeof project.companyId === 'string' ? project.companyId : String(project.companyId);
      const company = companyLookup.get(companyIdStr);
      if (company && company.name) {
        console.log(`Found company from lookup: ${company.name}`);
        return company.name;
      }
    }
    
    console.log(`Company not found for project: ${projectIdStr}`);
    return 'Unknown Company';
  };

  // Fixed custom label rendering function for pie charts
  const renderCustomizedLabel = (entry: any, data: any[]) => {
    if (!entry || entry.value === 0 || !data || data.length === 0) return null;
    
    try {
      const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
      if (total === 0) return null;
      
      const percent = ((entry.value / total) * 100).toFixed(0);
      return `${entry.name}: ${percent}%`;
    } catch (error) {
      console.error('Error in renderCustomizedLabel:', error);
      return null;
    }
  };

  const handlePaymentSubmit = () => {
    console.log('Payment submitted, refreshing data...');
    toast({
      title: "Payment Added",
      description: "Payment has been recorded successfully.",
    });
    setIsPaymentDialogOpen(false);
    // Force refetch to ensure immediate update
    refetch();
  };

  const handleExpenseSubmit = () => {
    console.log('Expense submitted, refreshing data...');
    toast({
      title: "Expense Added", 
      description: "Expense has been recorded successfully.",
    });
    setIsExpenseDialogOpen(false);
    // Force refetch to ensure immediate update
    refetch();
  };

  // Export functions
  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await exportToFormat('csv');
      downloadFile(blob, `${tab}-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error(`Error exporting to Excel:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToPdf = async () => {
    try {
      setIsExporting(true);
      const blob = await exportToFormat('pdf');
      downloadFile(blob, `${tab}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error(`Error exporting to PDF:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((expense as any).category && (expense as any).category.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
        <TabsList className="mb-6">
          <TabsTrigger value="charts">Charts & Summary</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts">
          {/* Filter tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`pb-2 px-4 ${
                tab === 'payments'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTab('payments')}
            >
              Payments ({payments.length})
            </button>
            <button
              className={`pb-2 px-4 ${
                tab === 'expenses'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTab('expenses')}
            >
              Expenses ({expenses.length})
            </button>
          </div>

          {/* Time filter */}
          <div className="flex mb-6 overflow-x-auto pb-2">
            <button
              className={`px-3 py-1 text-sm rounded-full mr-2 ${
                timeFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setTimeFilter('all')}
            >
              All Time
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full mr-2 ${
                timeFilter === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setTimeFilter('month')}
            >
              This Month
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full mr-2 ${
                timeFilter === 'quarter'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setTimeFilter('quarter')}
            >
              This Quarter
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full mr-2 ${
                timeFilter === 'year'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setTimeFilter('year')}
            >
              This Year
            </button>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                {tab === 'payments' ? 'Payment Status' : 'Expense Categories'}
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tab === 'payments' ? paymentStatusData : expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => renderCustomizedLabel(entry, tab === 'payments' ? paymentStatusData : expenseCategoryData)}
                      outerRadius={80}
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
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                By Company
              </h2>
              <div className="h-64">
                {tab === 'payments' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={companies.map(company => {
                        const companyProjects = projects.filter(p => p.companyId === company.id);
                        const projectIds = companyProjects.map(p => p.id);
                        
                        const totalPayments = payments
                          .filter((p: Transaction) => projectIds.includes(p.project) && (p as any).status === 'paid')
                          .reduce((sum, p) => sum + p.amount, 0);
                        
                        const pendingPayments = payments
                          .filter((p: Transaction) => projectIds.includes(p.project) && ((p as any).status === 'pending' || (p as any).status === 'overdue'))
                          .reduce((sum, p) => sum + p.amount, 0);
                        
                        return {
                          name: company.name,
                          received: totalPayments,
                          pending: pendingPayments
                        };
                      })}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="received" fill="#10b981" name="Received" />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={companies.map(company => {
                        const companyProjects = projects.filter(p => p.companyId === company.id);
                        const projectIds = companyProjects.map(p => p.id);
                        
                        const totalExpenses = expenses
                          .filter((e: Transaction) => projectIds.includes(e.project))
                          .reduce((sum, e) => sum + e.amount, 0);
                        
                        return {
                          name: company.name,
                          expenses: totalExpenses
                        };
                      })}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
          
          {/* Transactions list */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {tab === 'payments' ? 'Recent Payments' : 'Recent Expenses'}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Project</th>
                    <th className="px-6 py-3 text-left">Company</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    {tab === 'payments' && <th className="px-6 py-3 text-left">Status</th>}
                    {tab === 'expenses' && <th className="px-6 py-3 text-left">Category</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tab === 'payments' ? (
                    payments.slice(0, 5).map((payment: Transaction) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{getProjectName(payment.project)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getProjectCompany(payment.project)}</td>
                        <td className="px-6 py-4">{payment.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(payment.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge 
                            status={(payment as any).status || 'pending'} 
                            colorClassName={getPaymentStatusColor((payment as any).status || 'pending')} 
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    expenses.slice(0, 5).map((expense: Transaction) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{getProjectName(expense.project)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getProjectCompany(expense.project)}</td>
                        <td className="px-6 py-4">{expense.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(expense.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(expense.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
        </TabsContent>
        
        <TabsContent value="transactions">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold">All Transactions</h2>
                <div className="mt-4 md:mt-0 flex gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Search transactions..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="payments" onValueChange={(val) => setTab(val as 'payments' | 'expenses')}>
                    <SelectTrigger className="w-[180px]">
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
                      <Button variant="outline" disabled={isExporting}>
                        <Download className="h-4 w-4 mr-2" />
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
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>{tab === 'payments' ? 'Status' : 'Category'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tab === 'payments' ? (
                    filteredPayments.map((payment: Transaction) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{getProjectName(payment.project)}</TableCell>
                        <TableCell>{getProjectCompany(payment.project)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
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
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{getProjectName(expense.project)}</TableCell>
                        <TableCell>{getProjectCompany(expense.project)}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finances;

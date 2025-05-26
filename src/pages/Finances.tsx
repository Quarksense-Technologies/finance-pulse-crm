import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const { data: transactions = [] } = useTransactions({ type: tab === 'payments' ? 'payment' : 'expense' });
  const { exportToFormat } = useExportTransactions();

  // Filter transactions by type - now using Transaction type from API
  const payments = transactions.filter(t => t.type === 'payment' || t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  // Prepare data for payment status pie chart
  const paidAmount = payments.filter(p => (p as any).status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => (p as any).status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments.filter(p => (p as any).status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  
  const paymentStatusData = [
    { name: 'Paid', value: paidAmount },
    { name: 'Pending', value: pendingAmount },
    { name: 'Overdue', value: overdueAmount }
  ];
  
  // Prepare data for expense categories pie chart
  const manpowerExpenses = expenses.filter(e => (e as any).category === 'salary').reduce((sum, e) => sum + e.amount, 0);
  const materialsExpenses = expenses.filter(e => (e as any).category === 'equipment').reduce((sum, e) => sum + e.amount, 0);
  const servicesExpenses = expenses.filter(e => (e as any).category === 'consulting').reduce((sum, e) => sum + e.amount, 0);
  const otherExpenses = expenses.filter(e => (e as any).category === 'other' || !(e as any).category).reduce((sum, e) => sum + e.amount, 0);
  
  const expenseCategoryData = [
    { name: 'Salary', value: manpowerExpenses },
    { name: 'Equipment', value: materialsExpenses },
    { name: 'Consulting', value: servicesExpenses },
    { name: 'Other', value: otherExpenses }
  ];
  
  const PAYMENT_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const EXPENSE_COLORS = ['#3b82f6', '#8b5cf6', '#6366f1', '#9ca3af'];

  // Get company & project names by ID
  const getCompanyName = (companyId: string): string => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown';
  };
  
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  const getProjectCompany = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 'Unknown';
    
    const company = companies.find(c => c.id === project.companyId);
    return company ? company.name : 'Unknown';
  };

  const handlePaymentSubmit = (data: any) => {
    console.log('Payment submitted:', data);
    toast({
      title: "Payment Added",
      description: `Payment of ${formatCurrency(data.amount)} has been recorded.`,
    });
    setIsPaymentDialogOpen(false);
  };

  const handleExpenseSubmit = (data: any) => {
    console.log('Expense submitted:', data);
    toast({
      title: "Expense Added",
      description: `Expense of ${formatCurrency(data.amount)} has been recorded.`,
    });
    setIsExpenseDialogOpen(false);
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

  // Filter transactions based on search query - using Transaction type
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
              Payments
            </button>
            <button
              className={`pb-2 px-4 ${
                tab === 'expenses'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTab('expenses')}
            >
              Expenses
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

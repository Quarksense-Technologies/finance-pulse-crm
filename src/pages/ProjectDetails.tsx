
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, IndianRupee, Building, CheckCircle, Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, getProjectStatusColor, formatProjectStatus } from '@/utils/financialUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProject } from '@/hooks/api/useProjects';
import { useTransactions } from '@/hooks/api/useFinances';
import { useProjectResources } from '@/hooks/api/useResources';
import PaymentForm from '@/components/forms/PaymentForm';
import ExpenseForm from '@/components/forms/ExpenseForm';
import ProjectStatusUpdate from '@/components/projects/ProjectStatusUpdate';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const { data: project, isLoading, error } = useProject(id || '');
  const { data: transactions = [] } = useTransactions({ project: id });
  const { data: projectResources = [], isLoading: resourcesLoading, error: resourcesError } = useProjectResources(id || '');

  console.log('Project ID:', id);
  console.log('Project Resources data:', projectResources);
  console.log('Resources loading:', resourcesLoading);
  console.log('Resources error:', resourcesError);

  const handleGoBack = () => {
    navigate('/projects');
  };

  const handlePaymentSubmit = () => {
    setIsPaymentDialogOpen(false);
  };

  const handleExpenseSubmit = () => {
    setIsExpenseDialogOpen(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading project details...</div>;
  }

  if (error || !project) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <p className="text-gray-500 mb-6">The project you're looking for doesn't exist or has been deleted</p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }

  // Filter transactions for this project
  const payments = transactions.filter(t => t.type === 'payment' || t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  // Calculate totals including resource costs
  const totalPaidPayments = payments.filter(p => (p as any).status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const resourceCosts = projectResources.reduce((sum, allocation) => sum + (allocation.hoursAllocated * (allocation.resource?.hourlyRate || 0)), 0);
  const totalExpensesWithResources = totalExpenses + resourceCosts;
  const profit = totalPaidPayments - totalExpensesWithResources;
  const pendingPayments = payments.filter(p => (p as any).status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overduePayments = payments.filter(p => (p as any).status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  const handleStatusUpdate = () => {
    // Status update handled by the hook
  };

  return (
    <div className="animate-fade-in max-h-screen overflow-y-auto">
      <div className="p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Button variant="ghost" className="mb-2 pl-0" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-center md:text-left">{project.name}</h1>
            <div className="flex items-center justify-center md:justify-start mt-1 text-gray-500 dark:text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <span>{project.companyName || 'Unknown Company'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3">
            <StatusBadge
              status={formatProjectStatus(project.status)}
              colorClassName={getProjectStatusColor(project.status)}
            />
            <ProjectStatusUpdate 
              projectId={project.id} 
              currentStatus={project.status}
              onStatusUpdated={handleStatusUpdate}
            />
          </div>
        </div>
        
        {/* Project stats - Mobile responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1 text-center">Revenue</div>
            <div className="text-xl sm:text-2xl font-semibold text-center">{formatCurrency(totalPaidPayments)}</div>
            <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground text-center">Total payments received</div>
          </div>
          
          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1 text-center">Expenses</div>
            <div className="text-xl sm:text-2xl font-semibold text-center">{formatCurrency(totalExpensesWithResources)}</div>
            <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground text-center">Including resource costs</div>
          </div>
          
          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1 text-center">Profit</div>
            <div className={`text-xl sm:text-2xl font-semibold text-center ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground text-center">Revenue - expenses</div>
          </div>
          
          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1 text-center">Pending</div>
            <div className="text-xl sm:text-2xl font-semibold text-center">{formatCurrency(pendingPayments)}</div>
            <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground text-center">Pending payments</div>
          </div>
          
          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1 text-center">Overdue</div>
            <div className="text-xl sm:text-2xl font-semibold text-center text-red-600">{formatCurrency(overduePayments)}</div>
            <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground text-center">Overdue payments</div>
          </div>
        </div>
        
        {/* Project details */}
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-max">
              <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap px-4">Overview</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm whitespace-nowrap px-4">Payments</TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm whitespace-nowrap px-4">Expenses</TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm whitespace-nowrap px-4">Resources</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">Project Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Description</h3>
                  <p className="mt-1">{project.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Budget</h3>
                  <p className="mt-1">{project.budget ? formatCurrency(project.budget) : 'No budget set'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Dates</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-muted-foreground" />
                    <span>
                      {formatDate(project.startDate)} - 
                      {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    <StatusBadge
                      status={formatProjectStatus(project.status)}
                      colorClassName={getProjectStatusColor(project.status)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card p-8 rounded-lg shadow-sm border border-gray-100 dark:border-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Latest Payments</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('payments')}>
                  View All
                </Button>
              </div>
              
              {payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-muted text-xs uppercase text-gray-700 dark:text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 text-left">Date</th>
                          <th className="px-6 py-3 text-left">Description</th>
                          <th className="px-6 py-3 text-left">Amount</th>
                          <th className="px-6 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-border">
                        {payments.slice(0, 3).map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.date)}</td>
                            <td className="px-6 py-4">{payment.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge 
                                status={(payment as any).status || 'pending'} 
                                colorClassName={getProjectStatusColor((payment as any).status || 'pending')} 
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                  No payments found for this project
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-card p-8 rounded-lg shadow-sm border border-gray-100 dark:border-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Latest Expenses</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('expenses')}>
                  View All
                </Button>
              </div>
              
              {expenses && expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-muted text-xs uppercase text-gray-700 dark:text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 text-left">Date</th>
                          <th className="px-6 py-3 text-left">Description</th>
                          <th className="px-6 py-3 text-left">Category</th>
                          <th className="px-6 py-3 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-border">
                        {expenses.slice(0, 3).map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(expense.date)}</td>
                            <td className="px-6 py-4">{expense.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge 
                                status={(expense as any).category || 'other'} 
                                colorClassName="bg-gray-100 text-gray-800" 
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(expense.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                  No expenses found for this project
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Payments tab */}
          <TabsContent value="payments">
            <div className="bg-white dark:bg-card p-8 rounded-lg shadow-sm border border-gray-100 dark:border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">Payments</h2>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">Add Payment</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] mx-8 max-h-[90vh] overflow-y-auto p-8">
                    <DialogHeader>
                      <DialogTitle>Add New Payment</DialogTitle>
                      <DialogDescription>
                        Add a new payment for this project
                      </DialogDescription>
                    </DialogHeader>
                    <PaymentForm 
                      preselectedProjectId={project.id}
                      onSubmit={handlePaymentSubmit}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-muted text-xs uppercase text-gray-700 dark:text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 text-left">Date</th>
                          <th className="px-6 py-3 text-left">Description</th>
                          <th className="px-6 py-3 text-left">Amount</th>
                          <th className="px-6 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-border">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.date)}</td>
                            <td className="px-6 py-4">{payment.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge 
                                status={(payment as any).status || 'pending'} 
                                colorClassName={getProjectStatusColor((payment as any).status || 'pending')} 
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                  No payments found for this project
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Expenses tab */}
          <TabsContent value="expenses">
            <div className="bg-white dark:bg-card p-8 rounded-lg shadow-sm border border-gray-100 dark:border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">Expenses</h2>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">Add Expense</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] mx-8 max-h-[90vh] overflow-y-auto p-8">
                    <DialogHeader>
                      <DialogTitle>Add New Expense</DialogTitle>
                      <DialogDescription>
                        Add a new expense for this project
                      </DialogDescription>
                    </DialogHeader>
                    <ExpenseForm 
                      preselectedProjectId={project.id}
                      onSubmit={handleExpenseSubmit}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              {expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-muted text-xs uppercase text-gray-700 dark:text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 text-left">Date</th>
                          <th className="px-6 py-3 text-left">Description</th>
                          <th className="px-6 py-3 text-left">Category</th>
                          <th className="px-6 py-3 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-border">
                        {expenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(expense.date)}</td>
                            <td className="px-6 py-4">{expense.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge 
                                status={(expense as any).category || 'other'} 
                                colorClassName="bg-gray-100 text-gray-800" 
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(expense.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                  No expenses found for this project
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Resources tab */}
          <TabsContent value="resources">
            <div className="bg-white dark:bg-card p-8 rounded-lg shadow-sm border border-gray-100 dark:border-border">
              <AttendanceManagement 
                projectId={project.id} 
                resources={projectResources}
                resourcesLoading={resourcesLoading}
                resourcesError={resourcesError}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;

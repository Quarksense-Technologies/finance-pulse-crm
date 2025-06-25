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
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-gray-500 mb-6">The project you're looking for doesn't exist or has been deleted</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </div>
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
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" className="pl-0" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{project.name}</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building className="h-4 w-4 mr-2" />
                <span>{project.companyName || 'Unknown Company'}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
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
        </div>
        
        {/* Project stats - Improved mobile responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Revenue</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold">{formatCurrency(totalPaidPayments)}</div>
              <div className="text-xs text-muted-foreground">Total payments received</div>
            </div>
          </div>
          
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Expenses</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold">{formatCurrency(totalExpensesWithResources)}</div>
              <div className="text-xs text-muted-foreground">Including resource costs</div>
            </div>
          </div>
          
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Profit</div>
              <div className={`text-lg sm:text-xl lg:text-2xl font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profit)}
              </div>
              <div className="text-xs text-muted-foreground">Revenue - expenses</div>
            </div>
          </div>
          
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Pending</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold">{formatCurrency(pendingPayments)}</div>
              <div className="text-xs text-muted-foreground">Pending payments</div>
            </div>
          </div>
          
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Overdue</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-red-600">{formatCurrency(overduePayments)}</div>
              <div className="text-xs text-muted-foreground">Overdue payments</div>
            </div>
          </div>
        </div>
        
        {/* Project details */}
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-4"
        >
          <div className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm">Resources</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Project Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-sm sm:text-base">{project.description || 'No description provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                  <p className="text-sm sm:text-base">{project.budget ? formatCurrency(project.budget) : 'No budget set'}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Dates</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm sm:text-base">
                      {formatDate(project.startDate)} - 
                      {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div>
                    <StatusBadge
                      status={formatProjectStatus(project.status)}
                      colorClassName={getProjectStatusColor(project.status)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            
            
            <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Latest Payments</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('payments')}>
                  View All
                </Button>
              </div>
              
              {payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <table className="min-w-full">
                      <thead className="bg-muted text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {payments.slice(0, 3).map((payment) => (
                          <tr key={payment.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">{formatDate(payment.date)}</td>
                            <td className="px-4 py-3 text-sm">{payment.description}</td>
                            <td className="px-4 py-3 text-sm font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="px-4 py-3">
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
                <div className="text-center py-8 text-muted-foreground">
                  No payments found for this project
                </div>
              )}
            </div>
            
            <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Latest Expenses</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('expenses')}>
                  View All
                </Button>
              </div>
              
              {expenses && expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <table className="min-w-full">
                      <thead className="bg-muted text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {expenses.slice(0, 3).map((expense) => (
                          <tr key={expense.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">{formatDate(expense.date)}</td>
                            <td className="px-4 py-3 text-sm">{expense.description}</td>
                            <td className="px-4 py-3">
                              <StatusBadge 
                                status={(expense as any).category || 'other'} 
                                colorClassName="bg-gray-100 text-gray-800" 
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{formatCurrency(expense.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses found for this project
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Payments tab */}
          <TabsContent value="payments">
            <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Payments</h2>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">Add Payment</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
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
                      <thead className="bg-muted text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">{formatDate(payment.date)}</td>
                            <td className="px-4 py-3 text-sm">{payment.description}</td>
                            <td className="px-4 py-3 text-sm font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="px-4 py-3">
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
                <div className="text-center py-8 text-muted-foreground">
                  No payments found for this project
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Expenses tab */}
          <TabsContent value="expenses">
            <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Expenses</h2>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">Add Expense</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
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
                      <thead className="bg-muted text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {expenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">{formatDate(expense.date)}</td>
                            <td className="px-4 py-3 text-sm">{expense.description}</td>
                            <td className="px-4 py-3">
                              <StatusBadge 
                                status={(expense as any).category || 'other'} 
                                colorClassName="bg-gray-100 text-gray-800" 
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{formatCurrency(expense.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses found for this project
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Resources tab */}
          <TabsContent value="resources">
            <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
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

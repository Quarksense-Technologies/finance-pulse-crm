
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, IndianRupee, Building, CheckCircle, Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, getProjectStatusColor, formatProjectStatus } from '@/utils/financialUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProject } from '@/hooks/api/useProjects';
import { useTransactions } from '@/hooks/api/useFinances';
import { useResources } from '@/hooks/api/useResources';
import PaymentForm from '@/components/forms/PaymentForm';
import ExpenseForm from '@/components/forms/ExpenseForm';
import ProjectManagement from '@/components/projects/ProjectManagement';
import ProjectStatusUpdate from '@/components/projects/ProjectStatusUpdate';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const { data: project, isLoading, error } = useProject(id || '');
  const { data: transactions = [] } = useTransactions({ project: id });
  const { data: resources = [], isLoading: resourcesLoading, error: resourcesError } = useResources(id);

  console.log('Project ID:', id);
  console.log('Resources data:', resources);
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
  const resourceCosts = resources.reduce((sum, r) => sum + (r.hoursAllocated * r.hourlyRate), 0);
  const totalExpensesWithResources = totalExpenses + resourceCosts;
  const profit = totalPaidPayments - totalExpensesWithResources;
  const pendingPayments = payments.filter(p => (p as any).status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overduePayments = payments.filter(p => (p as any).status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  const handleStatusUpdate = () => {
    // Status update handled by the hook
  };

  const handleProjectUpdated = () => {
    // Handle project update
  };

  return (
    <div className="animate-fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" className="mb-2 pl-0" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center mt-1 text-gray-500 dark:text-muted-foreground">
            <Building className="h-4 w-4 mr-1" />
            <span>{project.companyName || 'Unknown Company'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Revenue</div>
          <div className="text-xl sm:text-2xl font-semibold">{formatCurrency(totalPaidPayments)}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground">Total payments received</div>
        </div>
        
        <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Expenses</div>
          <div className="text-xl sm:text-2xl font-semibold">{formatCurrency(totalExpensesWithResources)}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground">Including resource costs</div>
        </div>
        
        <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Profit</div>
          <div className={`text-xl sm:text-2xl font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(profit)}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground">Revenue - expenses</div>
        </div>
        
        <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Pending</div>
          <div className="text-xl sm:text-2xl font-semibold">{formatCurrency(pendingPayments)}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground">Pending payments</div>
        </div>
        
        <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Overdue</div>
          <div className="text-xl sm:text-2xl font-semibold text-red-600">{formatCurrency(overduePayments)}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-muted-foreground">Overdue payments</div>
        </div>
      </div>
      
      {/* Project details */}
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5 overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs sm:text-sm">Resources</TabsTrigger>
          <TabsTrigger value="management" className="text-xs sm:text-sm">Management</TabsTrigger>
        </TabsList>
        
        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Project Details</h2>
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
          
          <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
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
          
          <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
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
          <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Payments</h2>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">Add Payment</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
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
          <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Expenses</h2>
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">Add Expense</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
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
          <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-border">
            <h2 className="text-lg sm:text-xl font-semibold mb-6">Project Resources</h2>
            
            {resourcesLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                Loading resources...
              </div>
            ) : resourcesError ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">Error loading resources</div>
                <div className="text-sm text-gray-500 dark:text-muted-foreground">{resourcesError.message}</div>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                No resources assigned to this project
                <div className="text-sm mt-2">
                  You can add resources from the Manpower page
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div 
                    key={resource.id} 
                    className="border border-gray-100 dark:border-border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{resource.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">{resource.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(resource.hourlyRate * resource.hoursAllocated)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-muted-foreground">Total cost</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {formatDate(resource.startDate)} - 
                          {resource.endDate ? formatDate(resource.endDate) : 'Ongoing'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-2" />
                        <span>{formatCurrency(resource.hourlyRate)} / hour</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{resource.hoursAllocated} hours allocated</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Resource Cost:</span>
                    <span className="text-lg font-semibold">{formatCurrency(resourceCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-sm text-gray-600 dark:text-muted-foreground">
                    <span>Total Hours Allocated:</span>
                    <span>{resources.reduce((sum, r) => sum + r.hoursAllocated, 0)} hours</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Management tab */}
        <TabsContent value="management">
          <ProjectManagement project={project} onProjectUpdated={handleProjectUpdated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;

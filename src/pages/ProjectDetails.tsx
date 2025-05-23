
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowDown, Calendar, Plus, User, Users, DollarSign } from 'lucide-react';
import { Payment, Expense, Resource } from '@/data/types';
import { formatCurrency, formatDate, calculateProjectRevenue, calculateProjectExpenses, calculateProjectProfit } from '@/utils/financialUtils';
import { toast } from "@/components/ui/use-toast";
import StatusBadge from '@/components/ui/StatusBadge';
import PaymentForm from '@/components/forms/PaymentForm';
import ExpenseForm from '@/components/forms/ExpenseForm';
import ResourceForm from '@/components/forms/ResourceForm';
import { useProject, useAddPayment, useAddExpense, useAddResource } from '@/hooks/api/useProjects';

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);

  // Use React Query to fetch project data
  const { data: project, isLoading, error } = useProject(projectId || '');
  
  // Mutation hooks
  const addPayment = useAddPayment();
  const addExpense = useAddExpense();
  const addResource = useAddResource();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-bold mb-4">Loading Project Details...</h2>
      </div>
    );
  }
  
  // Handle error state
  if (error || !project) {
    console.error("Error loading project:", error);
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/projects')}>Return to Projects</Button>
      </div>
    );
  }

  const handlePaymentSubmit = (formData: Partial<Payment>) => {
    if (!projectId) return;
    
    addPayment.mutate({ 
      projectId, 
      paymentData: formData as Omit<Payment, 'id' | 'projectId'> 
    }, {
      onSuccess: () => {
        setIsPaymentDialogOpen(false);
      }
    });
  };

  const handleExpenseSubmit = (formData: Partial<Expense>) => {
    if (!projectId) return;
    
    addExpense.mutate({ 
      projectId, 
      expenseData: formData as Omit<Expense, 'id' | 'projectId'> 
    }, {
      onSuccess: () => {
        setIsExpenseDialogOpen(false);
      }
    });
  };

  const handleResourceSubmit = (formData: Partial<Resource>) => {
    if (!projectId) return;
    
    addResource.mutate({ 
      projectId, 
      resourceData: formData as Omit<Resource, 'id' | 'projectId'> 
    }, {
      onSuccess: () => {
        setIsResourceDialogOpen(false);
      }
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Back button and header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/projects')} 
          className="text-gray-500 mb-4 flex items-center hover:text-gray-700"
        >
          <ArrowDown className="w-4 h-4 transform rotate-90 mr-1" />
          Back to Projects
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-500 mt-1">
              {project.companyName || project.companyId} • Started {formatDate(project.startDate)}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
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
                    Record a new payment for this project.
                  </DialogDescription>
                </DialogHeader>
                <PaymentForm 
                  preselectedProjectId={projectId}
                  onSubmit={handlePaymentSubmit} 
                />
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
                    Record a new expense for this project.
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm 
                  preselectedProjectId={projectId}
                  onSubmit={handleExpenseSubmit} 
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Assign Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Assign Resource</DialogTitle>
                  <DialogDescription>
                    Assign a team member to this project.
                  </DialogDescription>
                </DialogHeader>
                <ResourceForm 
                  preselectedProjectId={projectId}
                  onSubmit={handleResourceSubmit} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Project Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-xl font-semibold">{formatCurrency(calculateProjectRevenue(project))}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Expenses</h3>
              <p className="text-xl font-semibold">{formatCurrency(calculateProjectExpenses(project))}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Profit</h3>
              <p className={`text-xl font-semibold ${
                calculateProjectProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(calculateProjectProfit(project))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Resources</h3>
              <p className="text-xl font-semibold">{project.resources?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-gray-200 w-full justify-start rounded-none p-0">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
            >
              Resources
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="mt-1">{project.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                      <p className="mt-1">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                      <p className="mt-1">{project.endDate ? formatDate(project.endDate) : 'Ongoing'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div className="mt-1">
                      <StatusBadge status={project.status} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                {project.companyId ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Company Name</h4>
                      <p className="mt-1">{project.companyName || project.companyId}</p>
                    </div>
                    {/* Contact info section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                      <p className="mt-1">{project.managers && project.managers.length > 0 ? project.managers[0] : 'Not specified'}</p>
                    </div>
                    {/* We don't have these properties in the Project interface, so we'll display a message instead */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                        <p className="mt-1">Contact details not available in project record</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Company information not available</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment History</h3>
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
                      Record a new payment for this project.
                    </DialogDescription>
                  </DialogHeader>
                  <PaymentForm 
                    preselectedProjectId={projectId}
                    onSubmit={handlePaymentSubmit} 
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            {project.payments && project.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No payments recorded for this project yet.</p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => setIsPaymentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Payment
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Expenses Tab */}
          <TabsContent value="expenses" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Expense Records</h3>
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
                      Record a new expense for this project.
                    </DialogDescription>
                  </DialogHeader>
                  <ExpenseForm 
                    preselectedProjectId={projectId}
                    onSubmit={handleExpenseSubmit} 
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            {project.expenses && project.expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <StatusBadge status={expense.category} />
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses recorded for this project yet.</p>
                <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => setIsExpenseDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Expense
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Resources Tab */}
          <TabsContent value="resources" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assigned Resources</h3>
              <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <User className="h-4 w-4 mr-2" />
                    Assign Resource
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Assign Resource</DialogTitle>
                    <DialogDescription>
                      Assign a team member to this project.
                    </DialogDescription>
                  </DialogHeader>
                  <ResourceForm 
                    preselectedProjectId={projectId}
                    onSubmit={handleResourceSubmit} 
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            {project.resources && project.resources.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Hours Allocated</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>{resource.name}</TableCell>
                        <TableCell>{resource.role}</TableCell>
                        <TableCell>{resource.hoursAllocated}</TableCell>
                        <TableCell>{formatCurrency(resource.hourlyRate)}</TableCell>
                        <TableCell>{formatDate(resource.startDate)}</TableCell>
                        <TableCell>{resource.endDate ? formatDate(resource.endDate) : 'Ongoing'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No resources assigned to this project yet.</p>
                <Button className="mt-4" onClick={() => setIsResourceDialogOpen(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Assign First Resource
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;

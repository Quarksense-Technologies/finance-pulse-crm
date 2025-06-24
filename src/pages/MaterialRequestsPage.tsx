
import React, { useState } from 'react';
import { Plus, Package, Clock, AlertCircle, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMaterialRequests } from '@/hooks/api/useMaterials';
import { useProjects } from '@/hooks/api/useProjects';
import MaterialRequestForm from '@/components/forms/MaterialRequestForm';
import MultiItemMaterialRequestForm from '@/components/forms/MultiItemMaterialRequestForm';
import { formatCurrency } from '@/utils/financialUtils';

const MaterialRequestsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  
  const { data: materialRequests = [], isLoading } = useMaterialRequests();
  const { data: projects = [] } = useProjects();

  const filteredRequests = materialRequests.filter(request => {
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    if (projectFilter !== 'all' && request.projectId !== projectFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const totalEstimatedCost = filteredRequests.reduce((sum, req) => sum + (req.estimatedCost || 0), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading material requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Material Requests
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Request materials for your projects
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full lg:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Material Request</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Item</TabsTrigger>
                  <TabsTrigger value="multiple">Multiple Items</TabsTrigger>
                </TabsList>
                
                <TabsContent value="single">
                  <MaterialRequestForm onSubmit={() => setIsDialogOpen(false)} />
                </TabsContent>
                
                <TabsContent value="multiple">
                  <MultiItemMaterialRequestForm onSubmit={() => setIsDialogOpen(false)} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Requests
                  </h3>
                  <p className="text-xl font-semibold">{filteredRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Pending
                  </h3>
                  <p className="text-xl font-semibold">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Approved
                  </h3>
                  <p className="text-xl font-semibold">
                    {filteredRequests.filter(req => req.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Est. Cost
                  </h3>
                  <p className="text-xl font-semibold">{formatCurrency(totalEstimatedCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Material Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No material requests found</h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter !== 'all' || projectFilter !== 'all' 
                    ? 'No requests match your current filters'
                    : 'Start by creating your first material request'
                  }
                </p>
                {statusFilter === 'all' && projectFilter === 'all' && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Request
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            ) : (
              <div className="w-full">
                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredRequests.map((request) => {
                    const project = projects.find(p => p.id === request.projectId);
                    
                    return (
                      <Card key={request.id} className="w-full">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">{request.description}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {project?.name || 'Unknown Project'}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
                                  {request.urgency}
                                </Badge>
                                <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(request.status)}
                                    {request.status}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Part:</span>
                                <span className="ml-1">{request.partNo || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Qty:</span>
                                <span className="ml-1">{request.quantity}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Est. Cost:</span>
                                <span className="ml-1 font-medium">
                                  {request.estimatedCost ? formatCurrency(request.estimatedCost) : 'TBD'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Project</div>
                    <div className="col-span-2">Part No</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-2">Cost</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-1">Status</div>
                  </div>

                  <div className="divide-y divide-border">
                    {filteredRequests.map((request) => {
                      const project = projects.find(p => p.id === request.projectId);
                      
                      return (
                        <div key={request.id} className="grid grid-cols-12 gap-4 items-center px-4 py-4 text-sm">
                          <div className="col-span-3">
                            <div className="font-medium">{request.description}</div>
                            {request.notes && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {request.notes}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2">
                            {project?.name || 'Unknown Project'}
                          </div>
                          <div className="col-span-2">
                            {request.partNo || 'N/A'}
                          </div>
                          <div className="col-span-1">
                            {request.quantity}
                          </div>
                          <div className="col-span-2 font-medium">
                            {request.estimatedCost ? formatCurrency(request.estimatedCost) : 'TBD'}
                          </div>
                          <div className="col-span-1">
                            <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency}
                            </Badge>
                          </div>
                          <div className="col-span-1">
                            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaterialRequestsPage;

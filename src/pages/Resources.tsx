
import React, { useState } from 'react';
import { Users, Plus, User, Clock, DollarSign, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useResources } from '@/hooks/api/useResources';
import ResourceForm from '@/components/forms/ResourceForm';
import { formatCurrency } from '@/utils/financialUtils';

const Resources = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: resources = [], isLoading } = useResources();

  const activeResources = resources.filter(resource => resource.isActive);
  const avgHourlyRate = resources.length > 0 
    ? resources.reduce((sum, resource) => sum + resource.hourlyRate, 0) / resources.length 
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Resource Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your team members and their information
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto shrink-0" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Resource</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <ResourceForm onSubmit={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Resources
                </h3>
                <p className="text-2xl sm:text-3xl font-bold">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Active Resources
                </h3>
                <p className="text-2xl sm:text-3xl font-bold">{activeResources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Avg Hourly Rate
                </h3>
                <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(avgHourlyRate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources List */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Resources List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {resources.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No resources added yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first team member
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {resources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">
                                {resource.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {resource.role}
                              </p>
                            </div>
                            <Badge 
                              variant={resource.isActive ? "default" : "secondary"}
                              className="text-xs shrink-0"
                            >
                              {resource.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="truncate">{resource.email}</span>
                            </div>
                            
                            {resource.phone && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="truncate">{resource.phone}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="text-muted-foreground">Rate:</span>
                              <span className="font-medium">{formatCurrency(resource.hourlyRate)}/hr</span>
                            </div>

                            {resource.department && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <span className="text-muted-foreground">Dept:</span>
                                <span className="truncate">{resource.department}</span>
                              </div>
                            )}

                            {resource.skills && resource.skills.length > 0 && (
                              <div className="pt-2">
                                <p className="text-xs text-muted-foreground mb-1">Skills:</p>
                                <div className="flex flex-wrap gap-1">
                                  {resource.skills.slice(0, 3).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {resource.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                      +{resource.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Resources;


import React, { useState } from 'react';
import { Trash2, Edit, Calendar, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/financialUtils';
import { Button } from "@/components/ui/button";
import { useResources, useDeleteResource } from '@/hooks/api/useResources';
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectInfo {
  id: string;
  name: string;
}

const ResourcesList = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  
  // Fetch resources from the API
  const { data: resources = [], isLoading } = useResources();
  const deleteResourceMutation = useDeleteResource();

  if (isLoading) {
    return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">Loading resources...</div>;
  }

  const handleDeleteResource = async () => {
    if (resourceToDelete) {
      try {
        await deleteResourceMutation.mutateAsync(resourceToDelete);
        toast({
          title: "Resource Deleted",
          description: "The resource has been successfully removed.",
        });
      } catch (error) {
        // Error handling is done by the API service
        console.error('Error deleting resource:', error);
      } finally {
        setResourceToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  const renderProjectName = (projectId: any): string => {
    if (!projectId) return 'Unknown Project';
    
    if (typeof projectId === 'object' && projectId !== null) {
      return 'name' in projectId ? String(projectId.name) : 'Unnamed Project';
    }
    
    return String(projectId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Resources List</h2>
      
      {resources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No resources found. Add a resource to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div 
              key={resource.id} 
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{resource.name}</h3>
                  <p className="text-sm text-gray-600">{resource.role}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setResourceToDelete(resource.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {formatDate(resource.startDate)} - 
                    {resource.endDate ? formatDate(resource.endDate) : 'Ongoing'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>{formatCurrency(resource.hourlyRate)} / hour</span>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">Total hours:</span>
                <span className="font-medium">{resource.hoursAllocated} hrs</span>
              </div>
              
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-gray-600">Total cost:</span>
                <span className="font-medium">
                  {formatCurrency(resource.hourlyRate * resource.hoursAllocated)}
                </span>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Project: {renderProjectName(resource.projectId)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resource
              and remove the allocated hours from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteResource}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourcesList;


import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useUpdateProject } from '@/hooks/api/useProjects';
import { formatProjectStatus, getProjectStatusColor } from '@/utils/financialUtils';

interface ProjectStatusUpdateProps {
  projectId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const ProjectStatusUpdate: React.FC<ProjectStatusUpdateProps> = ({
  projectId,
  currentStatus,
  onStatusUpdated
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateProjectMutation = useUpdateProject();
  
  const handleStatusChange = async () => {
    if (status === currentStatus) {
      toast({
        title: "No changes",
        description: "Status is already set to " + formatProjectStatus(status)
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await updateProjectMutation.mutateAsync({
        id: projectId,
        data: { status }
      });
      
      onStatusUpdated();
      
      toast({
        title: "Status updated",
        description: `Project status changed to ${formatProjectStatus(status)}`
      });
    } catch (error) {
      console.error('Failed to update project status:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the project status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={status}
        onValueChange={setStatus}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleStatusChange}
        disabled={isUpdating || status === currentStatus}
      >
        <Check className="h-4 w-4 mr-2" />
        Update
      </Button>
    </div>
  );
};

export default ProjectStatusUpdate;

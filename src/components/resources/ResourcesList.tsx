
import React from 'react';
import { Resource } from '@/data/types';
import { Users } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatDate } from '@/utils/financialUtils';
import { useQuery } from '@tanstack/react-query';
import { resourceService } from '@/services/api/resourceService';

interface ResourcesListProps {
  projectFilter?: string;
}

const ResourcesList: React.FC<ResourcesListProps> = ({ projectFilter }) => {
  // Fetch resources data from API
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources', { projectId: projectFilter }],
    queryFn: () => resourceService.getResources(projectFilter),
  });

  // Calculate total cost for a resource
  const calculateTotalCost = (resource: Resource): number => {
    return resource.hoursAllocated * resource.hourlyRate;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading resources...</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No resources</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding a new resource.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Manpower Resources</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          List of allocated resources and their details
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate ($/hr)</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className="font-medium">{resource.name}</TableCell>
                <TableCell>{resource.role}</TableCell>
                <TableCell>{resource.hoursAllocated}</TableCell>
                <TableCell>${resource.hourlyRate}</TableCell>
                <TableCell>${calculateTotalCost(resource).toLocaleString()}</TableCell>
                <TableCell>{formatDate(resource.startDate)}</TableCell>
                <TableCell>{resource.endDate ? formatDate(resource.endDate) : 'Ongoing'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ResourcesList;

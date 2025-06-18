
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { ProjectResourceAllocation } from '@/data/types';
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { useProjectAttendance, useCreateAttendance } from '@/hooks/api/useAttendance';
import { useRemoveResourceAllocation } from '@/hooks/api/useResources';
import AttendanceForm from '@/components/forms/AttendanceForm';
import ResourceAllocationDialog from '@/components/resources/ResourceAllocationDialog';
import { toast } from "@/hooks/use-toast";

interface AttendanceManagementProps {
  projectId: string;
  resources: ProjectResourceAllocation[];
  resourcesLoading: boolean;
  resourcesError: any;
}

const AttendanceManagement = ({ 
  projectId, 
  resources, 
  resourcesLoading, 
  resourcesError 
}: AttendanceManagementProps) => {
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: attendanceRecords = [], refetch: refetchAttendance } = useProjectAttendance(
    projectId, 
    currentMonth, 
    currentYear
  );

  const createAttendanceMutation = useCreateAttendance();
  const removeResourceMutation = useRemoveResourceAllocation();

  const handleAttendanceSubmit = async (attendanceData: any) => {
    try {
      await createAttendanceMutation.mutateAsync({
        ...attendanceData,
        projectId
      });
      setShowAttendanceForm(false);
      refetchAttendance();
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const handleRemoveResource = async (allocationId: string, resourceName: string) => {
    if (window.confirm(`Are you sure you want to remove ${resourceName} from this project?`)) {
      try {
        await removeResourceMutation.mutateAsync(allocationId);
        toast({
          title: "Success",
          description: `${resourceName} removed from project`,
        });
      } catch (error) {
        console.error('Error removing resource:', error);
      }
    }
  };

  const handleResourceAllocated = () => {
    // This will be handled by the query invalidation in the hook
  };

  if (resourcesLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Loading resources...</div>
      </div>
    );
  }

  if (resourcesError) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Error loading resources</span>
      </div>
    );
  }

  // Calculate attendance statistics
  const totalAttendanceHours = attendanceRecords.reduce((sum, record) => sum + record.totalHours, 0);
  const totalAttendanceCost = attendanceRecords.reduce((sum, record) => {
    const hourlyRate = record.hourlyRate || 0;
    return sum + (record.totalHours * hourlyRate);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Resource Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage project resources and track attendance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <ResourceAllocationDialog 
            projectId={projectId} 
            onResourceAllocated={handleResourceAllocated}
          />
          <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Record Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Attendance</DialogTitle>
              </DialogHeader>
              <AttendanceForm
                projectId={projectId}
                resources={resources}
                onSubmit={handleAttendanceSubmit}
                onCancel={() => setShowAttendanceForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Allocated Resources</h3>
                <p className="text-lg sm:text-2xl font-semibold">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Hours</h3>
                <p className="text-lg sm:text-2xl font-semibold">{totalAttendanceHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Cost</h3>
                <p className="text-lg sm:text-2xl font-semibold">{formatCurrency(totalAttendanceCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocated Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Allocated Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {resources.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours Allocated
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hourly Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {resources.map((allocation) => (
                      <tr key={allocation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {allocation.resource?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {allocation.resource?.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="secondary">
                            {allocation.resource?.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {allocation.hoursAllocated}h
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(allocation.resource?.hourlyRate || 0)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div>
                            <div>Start: {formatDate(allocation.startDate)}</div>
                            {allocation.endDate && (
                              <div>End: {formatDate(allocation.endDate)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedResourceId(allocation.resourceId);
                                setShowAttendanceForm(true);
                              }}
                              className="text-xs"
                            >
                              Add Attendance
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveResource(allocation.id, allocation.resource?.name || 'Resource')}
                              className="text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No resources allocated
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start by allocating resources to this project.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Attendance Records ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {record.resourceName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.resourceRole}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {record.checkInTime}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {record.checkOutTime}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {record.totalHours}h
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency((record.hourlyRate || 0) * record.totalHours)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No attendance records
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start recording attendance for allocated resources.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;


import React, { useState } from 'react';
import { Calendar, Clock, IndianRupee, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from '@/utils/financialUtils';
import { Resource } from '@/data/types';
import { toast } from "@/hooks/use-toast";
import { useProjectAttendance, useCreateAttendance } from '@/hooks/api/useAttendance';

interface AttendanceManagementProps {
  projectId: string;
  resources: Resource[];
  resourcesLoading: boolean;
  resourcesError: any;
}

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  projectId,
  resources,
  resourcesLoading,
  resourcesError
}) => {
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState<string>('09:00');
  const [checkOutTime, setCheckOutTime] = useState<string>('17:00');

  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useProjectAttendance(projectId);
  const createAttendanceMutation = useCreateAttendance();

  const calculateHours = (checkIn: string, checkOut: string): number => {
    const [checkInHour, checkInMinute] = checkIn.split(':').map(Number);
    const [checkOutHour, checkOutMinute] = checkOut.split(':').map(Number);
    
    const checkInTotal = checkInHour + checkInMinute / 60;
    const checkOutTotal = checkOutHour + checkOutMinute / 60;
    
    return Math.max(0, checkOutTotal - checkInTotal);
  };

  const handleAddAttendance = async () => {
    if (!selectedResource || !selectedDate || !checkInTime || !checkOutTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const totalHours = calculateHours(checkInTime, checkOutTime);
    
    if (totalHours <= 0) {
      toast({
        title: "Invalid Time",
        description: "Check-out time must be after check-in time",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAttendanceMutation.mutateAsync({
        resourceId: selectedResource,
        projectId: projectId,
        date: selectedDate,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime
      });

      setIsAddAttendanceOpen(false);
      setSelectedResource('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setCheckInTime('09:00');
      setCheckOutTime('17:00');

      toast({
        title: "Success",
        description: "Attendance record added successfully"
      });
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const getResourceName = (resourceId: string): string => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'Unknown Resource';
  };

  const getResourceRole = (resourceId: string): string => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.role : '';
  };

  const getResourceHourlyRate = (resourceId: string): number => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.hourlyRate : 0;
  };

  if (resourcesLoading || attendanceLoading) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (resourcesError) {
    return (
      <div className="text-center py-4">
        <div className="text-red-500 mb-2">Error loading resources</div>
        <div className="text-sm text-gray-500 dark:text-muted-foreground">{resourcesError.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-lg font-semibold">Resources & Attendance</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            Manage attendance for project resources
          </p>
        </div>
        
        {resources.length > 0 && (
          <Dialog open={isAddAttendanceOpen} onOpenChange={setIsAddAttendanceOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">Add Attendance</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-2 w-auto max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Add Attendance Record</DialogTitle>
                <DialogDescription className="text-sm">
                  Add check-in and check-out time for a resource
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-1">
                  <Label htmlFor="resource" className="text-sm">Resource</Label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} - {resource.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-sm">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="checkin" className="text-sm">Check-in</Label>
                    <Input
                      id="checkin"
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="checkout" className="text-sm">Check-out</Label>
                    <Input
                      id="checkout"
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                
                {checkInTime && checkOutTime && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Hours: {calculateHours(checkInTime, checkOutTime).toFixed(1)}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddAttendanceOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAddAttendance}
                  disabled={createAttendanceMutation.isPending}
                >
                  Add Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        <h3 className="text-base font-medium">Allocated Resources</h3>
        {resources.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-muted-foreground text-sm">
            No resources assigned to this project
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{resource.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-muted-foreground">{resource.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(resource.hourlyRate * resource.hoursAllocated)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-muted-foreground">Total cost</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 dark:text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {formatDate(resource.startDate)} - 
                        {resource.endDate ? formatDate(resource.endDate) : 'Ongoing'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      <span>{formatCurrency(resource.hourlyRate)} / hour</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{resource.hoursAllocated} hours allocated</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Records */}
      <div className="space-y-3">
        <h3 className="text-base font-medium">Attendance Records</h3>
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-muted-foreground text-sm">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-card rounded-lg border border-gray-100 dark:border-border">
              <thead className="bg-gray-50 dark:bg-muted">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-border">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-xs font-medium">{record.resourceName || getResourceName(record.resourceId)}</div>
                        <div className="text-xs text-gray-500 dark:text-muted-foreground">{record.resourceRole || getResourceRole(record.resourceId)}</div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      {record.checkInTime}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      {record.checkOutTime}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      {record.totalHours.toFixed(1)}h
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                      {formatCurrency(record.totalHours * (record.hourlyRate || getResourceHourlyRate(record.resourceId)))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {attendanceRecords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {attendanceRecords.reduce((sum, record) => sum + record.totalHours, 0).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-muted-foreground">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(
                    attendanceRecords.reduce(
                      (sum, record) => sum + (record.totalHours * (record.hourlyRate || getResourceHourlyRate(record.resourceId))),
                      0
                    )
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-muted-foreground">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {attendanceRecords.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-muted-foreground">Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceManagement;

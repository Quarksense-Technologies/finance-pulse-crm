
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

interface AttendanceRecord {
  id: string;
  resourceId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: number;
}

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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState<string>('09:00');
  const [checkOutTime, setCheckOutTime] = useState<string>('17:00');

  const calculateHours = (checkIn: string, checkOut: string): number => {
    const [checkInHour, checkInMinute] = checkIn.split(':').map(Number);
    const [checkOutHour, checkOutMinute] = checkOut.split(':').map(Number);
    
    const checkInTotal = checkInHour + checkInMinute / 60;
    const checkOutTotal = checkOutHour + checkOutMinute / 60;
    
    return Math.max(0, checkOutTotal - checkInTotal);
  };

  const handleAddAttendance = () => {
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

    const existingRecord = attendanceRecords.find(
      record => record.resourceId === selectedResource && record.date === selectedDate
    );

    if (existingRecord) {
      toast({
        title: "Record Exists",
        description: "Attendance record for this resource and date already exists",
        variant: "destructive"
      });
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `attendance-${Date.now()}`,
      resourceId: selectedResource,
      date: selectedDate,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      totalHours
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);
    setIsAddAttendanceOpen(false);
    setSelectedResource('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCheckInTime('09:00');
    setCheckOutTime('17:00');

    toast({
      title: "Attendance Added",
      description: "Attendance record has been added successfully"
    });
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

  if (resourcesLoading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
        Loading resources...
      </div>
    );
  }

  if (resourcesError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading resources</div>
        <div className="text-sm text-gray-500 dark:text-muted-foreground">{resourcesError.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Resources & Attendance</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
            Manage attendance for project resources
          </p>
        </div>
        
        {resources.length > 0 && (
          <Dialog open={isAddAttendanceOpen} onOpenChange={setIsAddAttendanceOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Attendance Record</DialogTitle>
                <DialogDescription>
                  Add check-in and check-out time for a resource
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger>
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
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin">Check-in Time</Label>
                    <Input
                      id="checkin"
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="checkout">Check-out Time</Label>
                    <Input
                      id="checkout"
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                    />
                  </div>
                </div>
                
                {checkInTime && checkOutTime && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Hours: {calculateHours(checkInTime, checkOutTime).toFixed(1)}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddAttendanceOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAttendance}>
                  Add Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Allocated Resources</h3>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No resources assigned to this project
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{resource.name}</h4>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Records */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Attendance Records</h3>
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-card rounded-lg border border-gray-100 dark:border-border">
              <thead className="bg-gray-50 dark:bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-border">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">{getResourceName(record.resourceId)}</div>
                        <div className="text-sm text-gray-500 dark:text-muted-foreground">{getResourceRole(record.resourceId)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.checkIn}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.checkOut}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {record.totalHours.toFixed(1)}h
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(record.totalHours * getResourceHourlyRate(record.resourceId))}
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
          <CardHeader>
            <CardTitle className="text-lg">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceRecords.reduce((sum, record) => sum + record.totalHours, 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500 dark:text-muted-foreground">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    attendanceRecords.reduce(
                      (sum, record) => sum + (record.totalHours * getResourceHourlyRate(record.resourceId)),
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-muted-foreground">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {attendanceRecords.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-muted-foreground">Total Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceManagement;

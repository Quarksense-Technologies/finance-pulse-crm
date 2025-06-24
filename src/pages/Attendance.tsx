
import React, { useState } from 'react';
import { Calendar, Clock, IndianRupee, Users, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from '@/utils/financialUtils';
import { useAttendanceReport } from '@/hooks/api/useAttendance';
import { useProjects } from '@/hooks/api/useProjects';

const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Fetch data from backend
  const { data: projects = [] } = useProjects();
  const { data: attendanceReports = [], isLoading } = useAttendanceReport(
    parseInt(selectedMonth) + 1, // API expects 1-based months
    parseInt(selectedYear),
    selectedProject === 'all' ? undefined : selectedProject
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const totalHours = attendanceReports.reduce((sum, report) => sum + (report.totalHours || 0), 0);
  const totalCost = attendanceReports.reduce((sum, report) => sum + (report.totalCost || 0), 0);
  const totalResources = attendanceReports.length;
  const averageHoursPerResource = totalResources > 0 ? totalHours / totalResources : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading attendance data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">
            Attendance Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Monthly work hours and cost analysis
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month" className="text-sm font-medium">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project" className="text-sm font-medium">Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select project" />
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
                <Button variant="outline" size="sm" className="w-full h-9 text-sm">
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg shrink-0">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Hours
                  </h3>
                  <p className="text-xl font-semibold">{totalHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg shrink-0">
                  <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Cost
                  </h3>
                  <p className="text-xl font-semibold">{formatCurrency(totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg shrink-0">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Resources
                  </h3>
                  <p className="text-xl font-semibold">{totalResources}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg shrink-0">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Avg Hours
                  </h3>
                  <p className="text-xl font-semibold">{averageHoursPerResource.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Report Table */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              Detailed Report - {months[parseInt(selectedMonth)]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {attendanceReports.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No attendance records found</h3>
                <p className="text-sm text-muted-foreground">
                  No attendance records found for the selected filters
                </p>
              </div>
            ) : (
              <div className="w-full">
                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3 p-4">
                  {attendanceReports.map((report, index) => (
                    <Card key={index} className="w-full">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{report.resourceName}</h4>
                              <p className="text-xs text-muted-foreground truncate">{report.resourceRole}</p>
                              <p className="text-xs text-muted-foreground truncate">{report.projectName}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(report.totalCost)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <div className="text-muted-foreground">Days</div>
                              <div className="font-medium">{report.totalDays}</div>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <div className="text-muted-foreground">Hours</div>
                              <div className="font-medium">{report.totalHours}h</div>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <div className="text-muted-foreground">Rate</div>
                              <div className="font-medium">{formatCurrency(report.hourlyRate)}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-full">
                    <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                      <div className="col-span-3">Resource</div>
                      <div className="col-span-2">Project</div>
                      <div className="col-span-1">Days</div>
                      <div className="col-span-2">Hours</div>
                      <div className="col-span-2">Rate</div>
                      <div className="col-span-2">Cost</div>
                    </div>

                    <div className="divide-y divide-border">
                      {attendanceReports.map((report, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-center px-4 py-4 text-sm">
                          <div className="col-span-3">
                            <div className="font-medium">{report.resourceName}</div>
                            <div className="text-xs text-muted-foreground">{report.resourceRole}</div>
                          </div>
                          <div className="col-span-2">
                            {report.projectName}
                          </div>
                          <div className="col-span-1">
                            {report.totalDays}
                          </div>
                          <div className="col-span-2 font-medium">
                            {report.totalHours}h
                          </div>
                          <div className="col-span-2">
                            {formatCurrency(report.hourlyRate)}
                          </div>
                          <div className="col-span-2 font-medium text-green-600">
                            {formatCurrency(report.totalCost)}
                          </div>
                        </div>
                      ))}
                    </div>
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

export default Attendance;

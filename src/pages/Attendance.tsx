
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
      <div className="flex justify-center items-center h-64">
        Loading attendance data...
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-2 sm:p-4 space-y-4">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Attendance Report</h1>
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            Monthly work hours and cost analysis
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="month" className="text-sm">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-9">
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

            <div className="space-y-1">
              <Label htmlFor="year" className="text-sm">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9">
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

            <div className="space-y-1">
              <Label htmlFor="project" className="text-sm">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="h-9">
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
              <Button variant="outline" size="sm" className="w-full h-9">
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-muted-foreground">Total Hours</h3>
                <p className="text-lg font-semibold">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-full">
                <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-muted-foreground">Total Cost</h3>
                <p className="text-lg font-semibold">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-muted-foreground">Resources</h3>
                <p className="text-lg font-semibold">{totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-muted-foreground">Avg Hours</h3>
                <p className="text-lg font-semibold">{averageHoursPerResource.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Detailed Report - {months[parseInt(selectedMonth)]} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {attendanceReports.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-muted-foreground text-sm">
              No attendance records found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-muted">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {attendanceReports.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-medium">{report.resourceName}</div>
                          <div className="text-xs text-gray-500 dark:text-muted-foreground">{report.resourceRole}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        {report.projectName}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        {report.totalDays}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                        {report.totalHours}h
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        {formatCurrency(report.hourlyRate)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-green-600">
                        {formatCurrency(report.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

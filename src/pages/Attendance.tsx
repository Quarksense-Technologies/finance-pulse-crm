
import React, { useState } from 'react';
import { Calendar, Clock, IndianRupee, Users, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from '@/utils/financialUtils';

interface AttendanceReport {
  resourceId: string;
  resourceName: string;
  resourceRole: string;
  projectId: string;
  projectName: string;
  month: string;
  year: number;
  totalHours: number;
  totalDays: number;
  hourlyRate: number;
  totalCost: number;
}

const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Mock data - in real app, this would come from API
  const attendanceReports: AttendanceReport[] = [
    {
      resourceId: '1',
      resourceName: 'John Doe',
      resourceRole: 'Senior Developer',
      projectId: 'proj1',
      projectName: 'E-commerce Platform',
      month: 'January',
      year: 2025,
      totalHours: 160,
      totalDays: 20,
      hourlyRate: 3000,
      totalCost: 480000
    },
    {
      resourceId: '2',
      resourceName: 'Jane Smith',
      resourceRole: 'UI/UX Designer',
      projectId: 'proj1',
      projectName: 'E-commerce Platform',
      month: 'January',
      year: 2025,
      totalHours: 140,
      totalDays: 18,
      hourlyRate: 2500,
      totalCost: 350000
    },
    {
      resourceId: '3',
      resourceName: 'Mike Johnson',
      resourceRole: 'Backend Developer',
      projectId: 'proj2',
      projectName: 'Mobile App Development',
      month: 'January',
      year: 2025,
      totalHours: 155,
      totalDays: 19,
      hourlyRate: 2800,
      totalCost: 434000
    }
  ];

  const projects = [
    { id: 'all', name: 'All Projects' },
    { id: 'proj1', name: 'E-commerce Platform' },
    { id: 'proj2', name: 'Mobile App Development' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const filteredReports = attendanceReports.filter(report => {
    const monthMatch = report.month === months[parseInt(selectedMonth)];
    const yearMatch = report.year === parseInt(selectedYear);
    const projectMatch = selectedProject === 'all' || report.projectId === selectedProject;
    
    return monthMatch && yearMatch && projectMatch;
  });

  const totalHours = filteredReports.reduce((sum, report) => sum + report.totalHours, 0);
  const totalCost = filteredReports.reduce((sum, report) => sum + report.totalCost, 0);
  const totalResources = filteredReports.length;
  const averageHoursPerResource = totalResources > 0 ? totalHours / totalResources : 0;

  return (
    <div className="animate-fade-in p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Attendance Report</h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">
            Monthly work hours and cost analysis
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
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
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
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
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Total Hours</h3>
                <p className="text-2xl font-semibold">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Total Cost</h3>
                <p className="text-2xl font-semibold">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Resources</h3>
                <p className="text-2xl font-semibold">{totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Avg Hours</h3>
                <p className="text-2xl font-semibold">{averageHoursPerResource.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Detailed Report - {months[parseInt(selectedMonth)]} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              No attendance records found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Days Worked
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Hourly Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                      Total Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {filteredReports.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">{report.resourceName}</div>
                          <div className="text-sm text-gray-500 dark:text-muted-foreground">{report.resourceRole}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {report.projectName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {report.totalDays}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {report.totalHours}h
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(report.hourlyRate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
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

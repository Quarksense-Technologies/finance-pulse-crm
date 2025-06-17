
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, User, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Resource {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hourlyRate: number;
  skills: string[];
  status: 'active' | 'inactive';
  projects: string[];
  joinDate: string;
}

const Resources = () => {
  const { hasPermission } = useAuth();
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Mock data - replace with actual API calls
  const resources: Resource[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Senior Developer',
      email: 'john.doe@company.com',
      phone: '+1234567890',
      hourlyRate: 50,
      skills: ['React', 'Node.js', 'TypeScript'],
      status: 'active',
      projects: ['Website Redesign', 'Mobile App'],
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'UI/UX Designer',
      email: 'jane.smith@company.com',
      phone: '+1234567891',
      hourlyRate: 45,
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      status: 'active',
      projects: ['Mobile App'],
      joinDate: '2023-03-20'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'Project Manager',
      email: 'mike.johnson@company.com',
      phone: '+1234567892',
      hourlyRate: 60,
      skills: ['Agile', 'Scrum', 'Leadership'],
      status: 'active',
      projects: ['E-commerce Platform'],
      joinDate: '2022-11-10'
    }
  ];

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!hasPermission('manage_resources')) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-gray-600 mt-1">Manage team members and their assignments</p>
        </div>
        <Dialog open={showResourceForm} onOpenChange={setShowResourceForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-500">Resource form will be available soon.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Resources</h3>
                <p className="text-2xl font-semibold">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Resources</h3>
                <p className="text-2xl font-semibold">
                  {resources.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Avg Hourly Rate</h3>
                <p className="text-2xl font-semibold">
                  {formatCurrency(resources.reduce((sum, r) => sum + r.hourlyRate, 0) / resources.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Resources ({resources.length})</CardTitle>
          <CardDescription>Manage your team members and their skills</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{resource.name}</div>
                      <div className="text-sm text-gray-500">{resource.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{resource.role}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {resource.skills.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {resource.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{resource.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(resource.hourlyRate)}/hr
                  </TableCell>
                  <TableCell>{getStatusBadge(resource.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {resource.projects.slice(0, 1).map(project => (
                        <div key={project}>{project}</div>
                      ))}
                      {resource.projects.length > 1 && (
                        <div className="text-gray-500">+{resource.projects.length - 1} more</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(resource.joinDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resource Detail Dialog */}
      {selectedResource && (
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedResource.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm">{selectedResource.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm">{getStatusBadge(selectedResource.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{selectedResource.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{selectedResource.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                  <p className="text-sm font-semibold">{formatCurrency(selectedResource.hourlyRate)}/hr</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Join Date</p>
                  <p className="text-sm">{formatDate(selectedResource.joinDate)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Skills</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedResource.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Current Projects</p>
                <div className="space-y-1">
                  {selectedResource.projects.map((project, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {project}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Resources;

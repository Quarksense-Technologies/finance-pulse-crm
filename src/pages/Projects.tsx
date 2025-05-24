
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Calendar, Users } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Project } from '@/data/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, getProjectStatusColor, calculateProjectProfit, formatCurrency } from '@/utils/financialUtils';
import { toast } from "@/hooks/use-toast";
import ProjectForm from '@/components/forms/ProjectForm';
import { useProjects, useCreateProject } from '@/hooks/api/useProjects';
import { useAuth } from '@/hooks/useAuth';

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);
  const { isAuthenticated } = useAuth();
  
  // Get the companyId from location state if available
  useEffect(() => {
    if (location.state?.companyId) {
      setSelectedCompanyId(location.state.companyId);
      // Open dialog if we're coming from a "Add Project" action elsewhere
      if (location.state.openDialog) {
        setIsDialogOpen(true);
      }
    }
  }, [location.state]);
  
  // Use React Query to fetch projects
  const { data: projects = [], isLoading, error } = useProjects({
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  
  // Mutation hook for creating projects
  const createProject = useCreateProject();

  // Filter projects by search query
  const filteredProjects = projects.filter(project => {
    if (searchQuery.trim() === '') return true;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(lowercaseQuery) ||
      (project.description && project.description.toLowerCase().includes(lowercaseQuery))
    );
  });

  const handleAddProject = (projectData: Partial<Project>) => {
    createProject.mutate(projectData as any, {
      onSuccess: () => {
        toast({
          title: "Project Added",
          description: `${projectData.name} has been added successfully.`,
        });
        setIsDialogOpen(false);
        // Clear the location state after successful addition
        navigate('.', { replace: true, state: {} });
        // Reset selected company
        setSelectedCompanyId(undefined);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to add project",
          variant: "destructive"
        });
      }
    });
  };

  const handleOpenDialog = (companyId?: string) => {
    if (companyId) {
      setSelectedCompanyId(companyId);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Clear location state and selected company when closing dialog
    navigate('.', { replace: true, state: {} });
    setSelectedCompanyId(undefined);
  };

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-64">Please login to view projects...</div>;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-500 mb-4">
          Error loading projects: {(error as any).message || "Failed to load projects"}
        </div>
        <button 
          onClick={() => navigate('/login')} 
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button 
                className="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new project.
                </DialogDescription>
              </DialogHeader>
              <ProjectForm 
                onSubmit={handleAddProject} 
                preselectedCompanyId={selectedCompanyId}
                onCancel={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`pb-2 px-4 ${
            statusFilter === 'all'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          className={`pb-2 px-4 ${
            statusFilter === 'in-progress'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setStatusFilter('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`pb-2 px-4 ${
            statusFilter === 'completed'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setStatusFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`pb-2 px-4 ${
            statusFilter === 'on-hold'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setStatusFilter('on-hold')}
        >
          On Hold
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-2 text-center py-10">
            <p className="text-gray-500">No projects found. Create a new project to get started.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Link
              to={`/projects/${project.id}`}
              key={project.id}
              className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hoverable"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <StatusBadge 
                  status={project.status} 
                  colorClassName={getProjectStatusColor(project.status)} 
                />
              </div>
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Ongoing'}</span>
              </div>
              
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                <span>{project.manpowerAllocated || 0} hours allocated</span>
              </div>
              
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Company:</span>
                  <span className="font-medium">{project.companyName || project.companyId}</span>
                </div>
                
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Profit:</span>
                  <span className={`font-medium ${
                    calculateProjectProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateProjectProfit(project) >= 0 ? '+' : ''}
                    {formatCurrency(calculateProjectProfit(project))}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;

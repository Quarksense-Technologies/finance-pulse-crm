
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Calendar, Users, Trash2, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from '@/data/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, getProjectStatusColor, formatCurrency } from '@/utils/financialUtils';
import { toast } from "@/hooks/use-toast";
import ProjectForm from '@/components/forms/ProjectForm';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/api/useProjects';
import { useAuth } from '@/hooks/useAuth';

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);
  const { isAuthenticated, user, hasPermission } = useAuth();
  const canDeleteProject = hasPermission('delete_project');
  
  console.log('Projects page - Auth state:', { isAuthenticated, user });
  console.log('Projects page - Token exists:', !!localStorage.getItem('token'));
  
  useEffect(() => {
    if (location.state?.companyId) {
      setSelectedCompanyId(location.state.companyId);
      if (location.state.openDialog) {
        setIsDialogOpen(true);
      }
    }
  }, [location.state]);
  
  const { data: projects = [], isLoading, error, refetch } = useProjects({
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  console.log('Projects data:', { 
    projects, 
    isLoading, 
    error: error?.message || error,
    projectsCount: projects.length 
  });

  const filteredProjects = projects.filter(project => {
    if (searchQuery.trim() === '') return true;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(lowercaseQuery) ||
      (project.description && project.description.toLowerCase().includes(lowercaseQuery))
    );
  });

  const handleAddProject = (projectData: Partial<Project>) => {
    console.log('Adding project with data:', projectData);
    
    createProject.mutate(projectData as any, {
      onSuccess: () => {
        setIsDialogOpen(false);
        navigate('.', { replace: true, state: {} });
        setSelectedCompanyId(undefined);
        refetch();
      }
    });
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        refetch();
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
    navigate('.', { replace: true, state: {} });
    setSelectedCompanyId(undefined);
  };

  const handleRetry = () => {
    console.log('Retrying to fetch projects...');
    refetch();
  };

  if (!isAuthenticated || !localStorage.getItem('token')) {
    console.log('User not authenticated, redirecting to login');
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-gray-500 mb-4">Please login to view projects</div>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div>Loading projects...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Projects error:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-red-500 mb-4 text-center">
              <div className="text-lg font-semibold mb-2">Error loading projects</div>
              <div className="text-sm">{(error as any).message || "Failed to load projects"}</div>
              {(error as any).response?.status === 401 && (
                <div className="text-xs mt-2 text-gray-500">Authentication required</div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleRetry} 
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Retry
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Projects</h1>
            </div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full sm:w-64 pl-10 p-2.5"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleOpenDialog()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to add a new project.
                    </DialogDescription>
                  </DialogHeader>
                  <ProjectForm 
                    onSubmit={handleAddProject} 
                    preselectedCompanyId={selectedCompanyId}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['all', 'in-progress', 'completed', 'on-hold'].map((filter) => (
              <button
                key={filter}
                className={`pb-2 px-4 whitespace-nowrap text-sm transition-colors ${
                  statusFilter === filter
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter === 'all' ? 'All' : filter.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardHeader className="text-center py-12">
              <CardTitle>No Projects Found</CardTitle>
              <p className="text-gray-500 mt-2">
                {projects.length === 0 
                  ? "No projects found. Create a new project to get started." 
                  : "No projects match your search criteria."
                }
              </p>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="group hover:shadow-lg transition-all duration-200 relative overflow-hidden"
              >
                {canDeleteProject && (
                  <div className="absolute top-4 right-4 z-10">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.name}"? This action will also delete all associated transactions and resources and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProject(project.id, project.name)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                <Link to={`/projects/${project.id}`} className="block">
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pr-8">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
                        <StatusBadge 
                          status={project.status} 
                          colorClassName={getProjectStatusColor(project.status)} 
                        />
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Ongoing'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{project.manpowerAllocated || 0} hours allocated</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Company:</span>
                          <span className="font-medium text-gray-900 truncate ml-2">{project.companyName || 'Unknown Company'}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-medium text-gray-900">{project.budget ? formatCurrency(project.budget) : 'Not set'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Profit/Loss:</span>
                          <div className="flex items-center">
                            {project.profit !== undefined ? (
                              <>
                                {project.profit >= 0 ? (
                                  <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                                )}
                                <span className={`font-medium ${
                                  project.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {project.profit >= 0 ? '+' : ''}
                                  {formatCurrency(project.profit)}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">Not calculated</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;


import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowDown, Briefcase, Users, DollarSign, Plus } from 'lucide-react';
import { useCompany } from '@/hooks/api/useCompanies';
import { useProjects } from '@/hooks/api/useProjects';
import { formatCurrency, formatDate, calculateProjectRevenue, calculateProjectExpenses, calculateProjectProfit } from '@/utils/financialUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { isHttpError } from '@/services/api/client';

const CompanyDetails = () => {
  const { id: companyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Log for debugging
  console.log('CompanyDetails - companyId param:', companyId);
  
  // Initialize all hooks regardless of companyId validity
  // This ensures hooks are always called in the same order
  const { data: company, isLoading: isCompanyLoading, error: companyError } = useCompany(companyId || '');
  const { data: projects = [], isLoading: isProjectsLoading, error: projectsError } = useProjects({ 
    companyId: companyId || ''
  });
  
  // Handler function
  const handleAddProject = () => {
    navigate('/projects', { 
      state: { 
        companyId: companyId,
        openDialog: true
      }
    });
  };

  // Now handle rendering based on conditions - after ALL hooks are called
  if (!companyId || companyId === 'undefined') {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Company Not Found</h2>
        <p className="text-gray-600 mb-6 text-center">Invalid company ID. Please select a valid company.</p>
        <Button onClick={() => navigate('/companies')}>Return to Companies</Button>
      </div>
    );
  }
  
  // Show loading state
  if (isCompanyLoading || isProjectsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading company details...</p>
      </div>
    );
  }

  // If company not found or error occurred
  if (companyError || !company) {
    const is404 = isHttpError(companyError, 404);
    const message = is404 ? "The company you're looking for doesn't exist or has been removed." : "Failed to load company details. Please try again later.";
    
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Company Not Found</h2>
        <p className="text-gray-600 mb-6 text-center">{message}</p>
        <Button onClick={() => navigate('/companies')}>Return to Companies</Button>
      </div>
    );
  }
  
  // Calculate total revenue, expenses, and profit
  const totalRevenue = projects.reduce((sum, project) => 
    sum + calculateProjectRevenue(project), 0);
  
  const totalExpenses = projects.reduce((sum, project) => 
    sum + calculateProjectExpenses(project), 0);
  
  const totalProfit = totalRevenue - totalExpenses;
  
  // Calculate total manpower allocation
  const totalManpower = projects.reduce((sum, project) => 
    sum + (project.resources?.reduce((sum, resource) => sum + resource.hoursAllocated, 0) || 0), 0);

  // Render the main component after all conditions are checked
  return (
    <div className="animate-fade-in p-6">
      {/* Back button and header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/companies')} 
          className="text-gray-500 mb-4 flex items-center hover:text-gray-700"
        >
          <ArrowDown className="w-4 h-4 transform rotate-90 mr-1" />
          Back to Companies
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-gray-500 mt-1">
              {company.contactPerson} • {company.email}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <Button className="bg-primary" onClick={handleAddProject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <p className="text-xl font-semibold">{projects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center">
            <Users className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Manpower</h3>
              <p className="text-xl font-semibold">{totalManpower} hours</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-xl font-semibold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
              <p className={`text-xl font-semibold ${
                totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Company Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-8">
        <h2 className="text-lg font-semibold mb-4 text-center">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
            <p className="mt-1">{company.contactPerson}</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{company.email}</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="mt-1">{company.phone}</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="mt-1">{company.address || 'Not provided'}</p>
          </div>
        </div>
      </div>
      
      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-center sm:text-left">Projects</h2>
          <Button className="bg-primary w-full sm:w-auto" onClick={handleAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
        
        {projects.length > 0 ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(project => (
              <Link
                to={`/projects/${project.id}`}
                key={project.id}
                className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 hoverable"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <h3 className="text-lg font-semibold text-center sm:text-left">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 text-center sm:text-left">{project.description}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Start Date:</span>
                    <span className="font-medium">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">End Date:</span>
                    <span className="font-medium">{project.endDate ? formatDate(project.endDate) : 'Ongoing'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Profit:</span>
                    <span className={`font-medium ${
                      calculateProjectProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(calculateProjectProfit(project))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Resources:</span>
                    <span className="font-medium">{project.resources?.length || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No projects found for this company.</p>
            <Button onClick={() => navigate('/projects/new', { state: { companyId } })}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;

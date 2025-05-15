
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowDown, Briefcase, Users, DollarSign, Plus } from 'lucide-react';
import { companies, projects } from '@/data/mockData';
import { formatCurrency, formatDate, calculateProjectRevenue, calculateProjectExpenses, calculateProjectProfit } from '@/utils/financialUtils';
import { toast } from "@/components/ui/use-toast";
import StatusBadge from '@/components/ui/StatusBadge';

const CompanyDetails = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  // Find the company by ID
  const company = companies.find(c => c.id === companyId);
  
  // If company not found, redirect or show error
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold mb-4">Company Not Found</h2>
        <p className="text-gray-600 mb-6">The company you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/companies')}>Return to Companies</Button>
      </div>
    );
  }

  // Get company projects
  const companyProjects = projects.filter(project => project.companyId === companyId);
  
  // Calculate total revenue, expenses, and profit
  const totalRevenue = companyProjects.reduce((sum, project) => 
    sum + calculateProjectRevenue(project), 0);
  
  const totalExpenses = companyProjects.reduce((sum, project) => 
    sum + calculateProjectExpenses(project), 0);
  
  const totalProfit = totalRevenue - totalExpenses;
  
  // Calculate total manpower allocation
  const totalManpower = companyProjects.reduce((sum, project) => 
    sum + project.resources.reduce((sum, resource) => sum + resource.hoursAllocated, 0), 0);

  return (
    <div className="animate-fade-in">
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
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-gray-500 mt-1">
              {company.contactPerson} • {company.email}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="bg-primary" onClick={() => navigate('/projects/new', { state: { companyId } })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Briefcase className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <p className="text-xl font-semibold">{companyProjects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Manpower</h3>
              <p className="text-xl font-semibold">{totalManpower} hours</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-xl font-semibold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-6">
        <h2 className="text-lg font-semibold mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
            <p className="mt-1">{company.contactPerson}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{company.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="mt-1">{company.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="mt-1">{company.address}</p>
          </div>
        </div>
      </div>
      
      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button className="bg-primary" onClick={() => navigate('/projects/new', { state: { companyId } })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
        
        {companyProjects.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyProjects.map(project => (
              <Link
                to={`/projects/${project.id}`}
                key={project.id}
                className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hoverable"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start Date:</span>
                    <span className="font-medium">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">End Date:</span>
                    <span className="font-medium">{project.endDate ? formatDate(project.endDate) : 'Ongoing'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Profit:</span>
                    <span className={`font-medium ${
                      calculateProjectProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(calculateProjectProfit(project))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resources:</span>
                    <span className="font-medium">{project.resources.length}</span>
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

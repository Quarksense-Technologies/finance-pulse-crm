
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, Users } from 'lucide-react';
import { projects, companies } from '@/data/mockData';
import { Project } from '@/data/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, getProjectStatusColor, calculateProjectProfit } from '@/utils/financialUtils';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Apply filters
    let result = projects;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(project => project.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(project =>
        project.name.toLowerCase().includes(lowercaseQuery) ||
        project.description.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    setFilteredProjects(result);
  }, [searchQuery, statusFilter]);

  // Get company name by ID
  const getCompanyName = (companyId: string): string => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

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
          <button className="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
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
            statusFilter === 'active'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setStatusFilter('active')}
        >
          Active
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
        {filteredProjects.map((project) => (
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
              <span>{project.manpowerAllocated} hours allocated</span>
            </div>
            
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Company:</span>
                <span className="font-medium">{getCompanyName(project.companyId)}</span>
              </div>
              
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Profit:</span>
                <span className={`font-medium ${
                  calculateProjectProfit(project) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateProjectProfit(project) >= 0 ? '+' : ''}
                  ${calculateProjectProfit(project).toLocaleString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Projects;

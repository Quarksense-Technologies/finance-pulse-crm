
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import ManpowerResourceForm from '@/components/resources/ManpowerResourceForm';
import ResourcesList from '@/components/resources/ResourcesList';
import { useQuery } from '@tanstack/react-query';
import { resourceService } from '@/services/api/resourceService';
import { formatCurrency } from '@/utils/financialUtils';

const Resources = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch resources data from API
  const { data: manpowerSummary, isLoading } = useQuery({
    queryKey: ['resourcesSummary'],
    queryFn: resourceService.getResourcesSummary
  });
  
  // Handle resource addition
  const handleResourceAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading resources...</div>;
  }

  const defaultSummary = {
    totalAllocated: 0,
    averageCost: 0,
    projectsWithResources: 0
  };

  const summary = manpowerSummary || defaultSummary;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Manpower Resources</h1>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Manpower</h3>
              <p className="text-2xl font-semibold">{summary.totalAllocated} hrs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Projects with Resources</h3>
              <p className="text-2xl font-semibold">{summary.projectsWithResources}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Average Hourly Cost</h3>
              <p className="text-2xl font-semibold">{formatCurrency(summary.averageCost)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form for adding resources */}
        <div className="lg:col-span-1">
          <ManpowerResourceForm onResourceAdded={handleResourceAdded} />
        </div>
        
        {/* List of resources */}
        <div className="lg:col-span-2">
          <ResourcesList key={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default Resources;

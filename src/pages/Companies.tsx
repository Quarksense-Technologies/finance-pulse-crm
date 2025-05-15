
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { companies } from '@/data/mockData';
import { Company } from '@/data/types';

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredCompanies(
        companies.filter((company) =>
          company.name.toLowerCase().includes(lowercaseQuery) ||
          company.contactPerson.toLowerCase().includes(lowercaseQuery) ||
          company.email.toLowerCase().includes(lowercaseQuery)
        )
      );
    }
  }, [searchQuery]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Link
            to={`/companies/${company.id}`}
            key={company.id}
            className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hoverable"
          >
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="font-medium">{company.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{company.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium">{company.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Projects:</span>
                <span className="font-medium">{company.projects.length}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Companies;

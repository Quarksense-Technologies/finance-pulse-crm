
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Company } from '@/data/types';
import { toast } from "@/hooks/use-toast";
import CompanyForm from '@/components/forms/CompanyForm';
import { useCompanies, useCreateCompany, useDeleteCompany } from '@/hooks/api/useCompanies';
import { useAuth } from '@/hooks/useAuth';

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canAddCompany = hasPermission('add_company');
  const canDeleteCompany = hasPermission('delete_company');
  
  const { data: companies = [], isLoading, error } = useCompanies();
  const createCompany = useCreateCompany();
  const deleteCompany = useDeleteCompany();

  const filteredCompanies = companies.filter(company => {
    if (searchQuery.trim() === '') return true;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(lowercaseQuery) ||
      company.contactPerson?.toLowerCase().includes(lowercaseQuery) ||
      company.email?.toLowerCase().includes(lowercaseQuery)
    );
  });

  const handleAddCompany = (companyData: any) => {
    const apiCompanyData = {
      name: companyData.name,
      description: companyData.description || '',
      logo: companyData.logo || '',
      address: {
        street: companyData.address || '',
        city: companyData.city || '',
        state: companyData.state || '',
        zipCode: companyData.zipCode || '',
        country: companyData.country || ''
      },
      contactInfo: {
        name: companyData.contactPerson || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        website: companyData.website || ''
      }
    };
    
    createCompany.mutate(apiCompanyData as any, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  const handleDeleteCompany = (companyId: string, companyName: string) => {
    deleteCompany.mutate(companyId);
  };
  
  const handleCompanyClick = (company: Company, e: React.MouseEvent) => {
    // Prevent navigation if clicked on action buttons
    if ((e.target as HTMLElement).closest('.action-buttons')) {
      return;
    }
    
    e.preventDefault();
    
    if (!company.id) {
      toast({
        title: "Navigation Error",
        description: "Cannot view details for this company due to missing ID.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/companies/${company.id}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading companies...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error loading companies: {(error as any).message}
      </div>
    );
  }

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
          {canAddCompany && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Company</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new company.
                  </DialogDescription>
                </DialogHeader>
                <CompanyForm onSubmit={handleAddCompany} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-3 text-center py-10">
            <p className="text-gray-500">No companies found. Create a new company to get started.</p>
          </div>
        ) : (
          filteredCompanies.map((company) => {
            if (!company.id) {
              console.warn('Company without ID detected:', company);
              return null;
            }
            
            return (
              <div
                key={company.id}
                className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hoverable cursor-pointer relative"
                onClick={(e) => handleCompanyClick(company, e)}
              >
                {canDeleteCompany && (
                  <div className="action-buttons absolute top-4 right-4 flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Company</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{company.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCompany(company.id, company.name)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold pr-8">{company.name}</h3>
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
                    <span className="font-medium">{company.projects?.length || 0}</span>
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)
        )}
      </div>
    </div>
  );
};

export default Companies;

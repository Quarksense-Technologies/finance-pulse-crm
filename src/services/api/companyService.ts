import apiClient from './client';
import { Company } from '@/data/types';
import { toast } from "@/hooks/use-toast";

export interface CreateCompanyData {
  name: string;
  description: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  managers?: string[];
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  managers?: string[];
}

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get('/companies');
      return response.data.map((company: any) => ({
        id: company._id || company.id,
        name: company.name,
        contactInfo: company.contactInfo,
        address: company.address,
        projects: company.projects || [],
        description: company.description || 'No description provided',
        logo: company.logo || '',
        managers: company.managers || [],
        createdAt: company.createdAt
      }));
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  async getCompanyById(id: string): Promise<Company> {
    try {
      if (!id || id === 'undefined') {
        const error = new Error('Invalid company ID');
        (error as any).status = 400;
        throw error;
      }
      
      const response = await apiClient.get(`/companies/${id}`);
      return {
        id: response.data._id || response.data.id,
        name: response.data.name || 'Unnamed Company',
        contactInfo: response.data.contactInfo,
        address: response.data.address,
        projects: response.data.projects || [],
        description: response.data.description || 'No description provided',
        logo: response.data.logo || '',
        managers: response.data.managers || [],
        createdAt: response.data.createdAt
      };
    } catch (error: any) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    try {
      const response = await apiClient.post('/companies', companyData);
      
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        name: response.data.name,
        contactInfo: response.data.contactInfo,
        address: response.data.address,
        projects: response.data.projects || [],
        description: response.data.description || 'No description provided',
        logo: response.data.logo || '',
        managers: response.data.managers || [],
        createdAt: response.data.createdAt
      };
    } catch (error: any) {
      console.error('Error creating company:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create company';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<Company> {
    try {
      if (!id || id === 'undefined') {
        throw new Error('Invalid company ID for update');
      }
      const response = await apiClient.put(`/companies/${id}`, companyData);
      
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        name: response.data.name,
        contactInfo: response.data.contactInfo,
        address: response.data.address,
        projects: response.data.projects || [],
        description: response.data.description || 'No description provided',
        logo: response.data.logo || '',
        managers: response.data.managers || [],
        createdAt: response.data.createdAt
      };
    } catch (error: any) {
      console.error(`Error updating company ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update company';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async deleteCompany(id: string): Promise<void> {
    try {
      if (!id || id === 'undefined') {
        throw new Error('Invalid company ID for deletion');
      }
      
      console.log(`Deleting company ${id}`);
      await apiClient.delete(`/companies/${id}`);
      
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting company ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete company';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }
};

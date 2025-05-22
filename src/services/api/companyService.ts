
import { toast } from "@/components/ui/use-toast";
import apiClient from './client';
import { Company } from '@/data/types';

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
}

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get('/companies');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  async getCompanyById(id: string): Promise<Company> {
    try {
      // Early validation to avoid making API calls with invalid IDs
      if (!id || id === 'undefined') {
        throw new Error('Invalid company ID');
      }
      
      const response = await apiClient.get(`/companies/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    try {
      const response = await apiClient.post('/companies', companyData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<Company> {
    try {
      const response = await apiClient.put(`/companies/${id}`, companyData);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  async deleteCompany(id: string): Promise<void> {
    try {
      await apiClient.delete(`/companies/${id}`);
    } catch (error: any) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  }
};


import { toast } from "@/components/ui/use-toast";
import apiClient from './client';
import { Company } from '@/data/types';

export interface CreateCompanyData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string; // Address is now optional
}

export interface UpdateCompanyData {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
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
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<Company> {
    try {
      const response = await apiClient.put(`/companies/${id}`, companyData);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  async deleteCompany(id: string): Promise<void> {
    try {
      await apiClient.delete(`/companies/${id}`);
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  }
};

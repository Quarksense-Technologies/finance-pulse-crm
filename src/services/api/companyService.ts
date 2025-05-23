
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
      // Transform API response to match our frontend Company type
      return response.data.map((company: any) => ({
        id: company._id || company.id,
        name: company.name,
        contactPerson: company.contactInfo?.name || company.contactInfo?.email || 'Unknown',
        email: company.contactInfo?.email || 'No email provided',
        phone: company.contactInfo?.phone || 'No phone provided',
        address: company.address ? 
          `${company.address.street || ''}, ${company.address.city || ''}, ${company.address.state || ''} ${company.address.zipCode || ''}, ${company.address.country || ''}`.replace(/^[, ]+|[, ]+$/g, '') : 
          'No address provided',
        projects: company.projects || [],
        description: company.description || 'No description provided',
        logo: company.logo || ''
      }));
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  async getCompanyById(id: string): Promise<Company> {
    try {
      // Early validation to avoid making API calls with invalid IDs
      if (!id || id === 'undefined') {
        const error = new Error('Invalid company ID');
        (error as any).status = 400;
        throw error;
      }
      
      const response = await apiClient.get(`/companies/${id}`);
      // Transform API response to match our frontend Company type
      return {
        id: response.data._id || response.data.id,
        name: response.data.name || 'Unnamed Company',
        contactPerson: response.data.contactInfo?.name || response.data.contactInfo?.email || 'Unknown',
        email: response.data.contactInfo?.email || 'No email provided',
        phone: response.data.contactInfo?.phone || 'No phone provided',
        address: response.data.address ? 
          `${response.data.address.street || ''}, ${response.data.address.city || ''}, ${response.data.address.state || ''} ${response.data.address.zipCode || ''}, ${response.data.address.country || ''}`.replace(/^[, ]+|[, ]+$/g, '') : 
          'No address provided',
        projects: response.data.projects || [],
        description: response.data.description || 'No description provided',
        logo: response.data.logo || ''
      };
    } catch (error: any) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    try {
      const response = await apiClient.post('/companies', companyData);
      // Transform API response to match our frontend Company type
      return {
        id: response.data._id || response.data.id,
        name: response.data.name,
        contactPerson: response.data.contactInfo?.name || response.data.contactInfo?.email || 'Unknown',
        email: response.data.contactInfo?.email || 'No email provided',
        phone: response.data.contactInfo?.phone || 'No phone provided',
        address: response.data.address ? 
          `${response.data.address.street || ''}, ${response.data.address.city || ''}, ${response.data.address.state || ''} ${response.data.address.zipCode || ''}, ${response.data.address.country || ''}`.replace(/^[, ]+|[, ]+$/g, '') : 
          'No address provided',
        projects: response.data.projects || [],
        description: response.data.description || 'No description provided',
        logo: response.data.logo || ''
      };
    } catch (error: any) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<Company> {
    try {
      if (!id || id === 'undefined') {
        throw new Error('Invalid company ID for update');
      }
      const response = await apiClient.put(`/companies/${id}`, companyData);
      // Transform API response to match our frontend Company type
      return {
        id: response.data._id || response.data.id,
        name: response.data.name,
        contactPerson: response.data.contactInfo?.name || response.data.contactInfo?.email || 'Unknown',
        email: response.data.contactInfo?.email || 'No email provided',
        phone: response.data.contactInfo?.phone || 'No phone provided',
        address: response.data.address ? 
          `${response.data.address.street || ''}, ${response.data.address.city || ''}, ${response.data.address.state || ''} ${response.data.address.zipCode || ''}, ${response.data.address.country || ''}`.replace(/^[, ]+|[, ]+$/g, '') : 
          'No address provided',
        projects: response.data.projects || [],
        description: response.data.description || 'No description provided',
        logo: response.data.logo || ''
      };
    } catch (error: any) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  async deleteCompany(id: string): Promise<void> {
    try {
      if (!id || id === 'undefined') {
        throw new Error('Invalid company ID for deletion');
      }
      await apiClient.delete(`/companies/${id}`);
    } catch (error: any) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  }
};

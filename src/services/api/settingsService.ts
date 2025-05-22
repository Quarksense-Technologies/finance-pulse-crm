
import apiClient from './client';
import { toast } from "@/components/ui/use-toast";

export interface SystemSettings {
  companyName: string;
  logo: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  dateFormat: string;
  emailNotifications: boolean;
  defaultApprovalThreshold: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  dashboardLayout: string[];
}

export const settingsService = {
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await apiClient.get('/settings/system');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },
  
  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await apiClient.put('/settings/system', settings);
      toast({
        title: "Success",
        description: "System settings updated successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating system settings:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update system settings",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  async getUserSettings(): Promise<UserSettings> {
    try {
      const response = await apiClient.get('/settings/user');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },
  
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await apiClient.put('/settings/user', settings);
      toast({
        title: "Success",
        description: "User settings updated successfully",
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating user settings:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user settings",
        variant: "destructive"
      });
      throw error;
    }
  }
};

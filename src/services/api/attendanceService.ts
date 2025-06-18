
import apiClient from './client';
import { toast } from "@/hooks/use-toast";

export interface AttendanceRecord {
  id: string;
  projectResourceId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  totalHours: number;
  resourceName?: string;
  resourceRole?: string;
  projectName?: string;
  hourlyRate?: number;
}

export interface CreateAttendanceData {
  projectResourceId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
}

export interface UpdateAttendanceData {
  checkInTime?: string;
  checkOutTime?: string;
}

export const attendanceService = {
  async getProjectAttendance(projectId: string, month?: number, year?: number): Promise<AttendanceRecord[]> {
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;

      console.log(`Fetching attendance for project ${projectId} with params:`, params);
      const response = await apiClient.get(`/attendance/project/${projectId}`, { params });
      console.log('Project attendance response:', response.data);
      
      return response.data.map((record: any) => ({
        id: record._id || record.id,
        projectResourceId: record.projectResourceId._id || record.projectResourceId,
        date: record.date,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        totalHours: record.totalHours,
        resourceName: record.projectResourceId?.resourceId?.name,
        resourceRole: record.projectResourceId?.resourceId?.role,
        projectName: record.projectResourceId?.projectId?.name,
        hourlyRate: record.projectResourceId?.resourceId?.hourlyRate
      }));
    } catch (error: any) {
      console.error(`Error fetching attendance for project ${projectId}:`, error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  },

  async getAttendanceReport(month?: number, year?: number, projectId?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (projectId) params.projectId = projectId;

      console.log('Fetching attendance report with params:', params);
      const response = await apiClient.get('/attendance/report', { params });
      console.log('Attendance report response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance report:', error);
      console.error('Error response:', error.response?.data);
      return [];
    }
  },

  async createAttendance(attendanceData: CreateAttendanceData): Promise<AttendanceRecord> {
    try {
      console.log('Creating attendance record with data:', attendanceData);
      
      // Validate the data before sending
      if (!attendanceData.projectResourceId) {
        throw new Error('Project Resource ID is required');
      }
      
      const response = await apiClient.post('/attendance', attendanceData);
      console.log('Create attendance response:', response.data);
      
      toast({
        title: "Success",
        description: "Attendance record created successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        projectResourceId: response.data.projectResourceId._id || response.data.projectResourceId,
        date: response.data.date,
        checkInTime: response.data.checkInTime,
        checkOutTime: response.data.checkOutTime,
        totalHours: response.data.totalHours,
        resourceName: response.data.projectResourceId?.resourceId?.name,
        resourceRole: response.data.projectResourceId?.resourceId?.role,
        projectName: response.data.projectResourceId?.projectId?.name,
        hourlyRate: response.data.projectResourceId?.resourceId?.hourlyRate
      };
    } catch (error: any) {
      console.error('Error creating attendance record:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create attendance record';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async updateAttendance(id: string, attendanceData: UpdateAttendanceData): Promise<AttendanceRecord> {
    try {
      console.log(`Updating attendance record ${id}:`, attendanceData);
      const response = await apiClient.put(`/attendance/${id}`, attendanceData);
      
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        projectResourceId: response.data.projectResourceId._id || response.data.projectResourceId,
        date: response.data.date,
        checkInTime: response.data.checkInTime,
        checkOutTime: response.data.checkOutTime,
        totalHours: response.data.totalHours,
        resourceName: response.data.projectResourceId?.resourceId?.name,
        resourceRole: response.data.projectResourceId?.resourceId?.role,
        projectName: response.data.projectResourceId?.projectId?.name,
        hourlyRate: response.data.projectResourceId?.resourceId?.hourlyRate
      };
    } catch (error: any) {
      console.error(`Error updating attendance record ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update attendance record';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async deleteAttendance(id: string): Promise<void> {
    try {
      console.log(`Deleting attendance record ${id}`);
      await apiClient.delete(`/attendance/${id}`);
      
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      });
    } catch (error: any) {
      console.error(`Error deleting attendance record ${id}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete attendance record';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }
};

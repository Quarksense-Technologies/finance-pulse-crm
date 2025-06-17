
import apiClient from './client';
import { toast } from "@/hooks/use-toast";

export interface AttendanceRecord {
  id: string;
  resourceId: string;
  projectId: string;
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
  resourceId: string;
  projectId: string;
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

      const response = await apiClient.get(`/attendance/project/${projectId}`, { params });
      console.log('Project attendance response:', response.data);
      
      return response.data.map((record: any) => ({
        id: record._id || record.id,
        resourceId: record.resourceId._id || record.resourceId,
        projectId: record.projectId._id || record.projectId,
        date: record.date,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        totalHours: record.totalHours,
        resourceName: record.resourceId?.name,
        resourceRole: record.resourceId?.role,
        projectName: record.projectId?.name,
        hourlyRate: record.resourceId?.hourlyRate
      }));
    } catch (error: any) {
      console.error(`Error fetching attendance for project ${projectId}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load attendance records';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async getAttendanceReport(month?: number, year?: number, projectId?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (projectId) params.projectId = projectId;

      const response = await apiClient.get('/attendance/report', { params });
      console.log('Attendance report response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load attendance report';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  },

  async createAttendance(attendanceData: CreateAttendanceData): Promise<AttendanceRecord> {
    try {
      console.log('Creating attendance record:', attendanceData);
      const response = await apiClient.post('/attendance', attendanceData);
      
      toast({
        title: "Success",
        description: "Attendance record created successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        resourceId: response.data.resourceId._id || response.data.resourceId,
        projectId: response.data.projectId._id || response.data.projectId,
        date: response.data.date,
        checkInTime: response.data.checkInTime,
        checkOutTime: response.data.checkOutTime,
        totalHours: response.data.totalHours,
        resourceName: response.data.resourceId?.name,
        resourceRole: response.data.resourceId?.role,
        projectName: response.data.projectId?.name,
        hourlyRate: response.data.resourceId?.hourlyRate
      };
    } catch (error: any) {
      console.error('Error creating attendance record:', error);
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
      const response = await apiClient.put(`/attendance/${id}`, attendanceData);
      
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });
      
      return {
        id: response.data._id || response.data.id,
        resourceId: response.data.resourceId._id || response.data.resourceId,
        projectId: response.data.projectId._id || response.data.projectId,
        date: response.data.date,
        checkInTime: response.data.checkInTime,
        checkOutTime: response.data.checkOutTime,
        totalHours: response.data.totalHours,
        resourceName: response.data.resourceId?.name,
        resourceRole: response.data.resourceId?.role,
        projectName: response.data.projectId?.name,
        hourlyRate: response.data.resourceId?.hourlyRate
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

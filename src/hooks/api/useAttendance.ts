
import { useQuery } from '@tanstack/react-query';

interface AttendanceRecord {
  resourceName: string;
  resourceRole: string;
  projectName: string;
  totalDays: number;
  totalHours: number;
  hourlyRate: number;
  totalCost: number;
}

// Store for attendance records
let attendanceRecords: AttendanceRecord[] = [];

// Attendance service
const attendanceService = {
  getAttendanceReport: async (month: number, year: number, projectId?: string): Promise<AttendanceRecord[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Fetching attendance records:', attendanceRecords);
    
    // Filter by project if specified
    if (projectId && projectId !== 'all') {
      return attendanceRecords.filter(record => 
        record.projectName.toLowerCase().includes(projectId.toLowerCase())
      );
    }

    return attendanceRecords;
  },

  addAttendanceRecord: async (record: AttendanceRecord): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    attendanceRecords.push(record);
    console.log('Added attendance record:', record);
  },

  clearAttendanceRecords: () => {
    attendanceRecords = [];
  }
};

export const useAttendanceReport = (month: number, year: number, projectId?: string) => {
  return useQuery({
    queryKey: ['attendanceReport', month, year, projectId],
    queryFn: () => attendanceService.getAttendanceReport(month, year, projectId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useAddAttendanceRecord = () => {
  return {
    mutateAsync: attendanceService.addAttendanceRecord
  };
};

export { attendanceService };

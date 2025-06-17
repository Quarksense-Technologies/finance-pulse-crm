
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

// Mock attendance service - replace with actual API calls
const attendanceService = {
  getAttendanceReport: async (month: number, year: number, projectId?: string): Promise<AttendanceRecord[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - replace with actual API call
    const mockData: AttendanceRecord[] = [
      {
        resourceName: "John Doe",
        resourceRole: "Developer",
        projectName: "Website Redesign",
        totalDays: 22,
        totalHours: 176,
        hourlyRate: 50,
        totalCost: 8800
      },
      {
        resourceName: "Jane Smith",
        resourceRole: "Designer",
        projectName: "Mobile App",
        totalDays: 20,
        totalHours: 160,
        hourlyRate: 45,
        totalCost: 7200
      },
      {
        resourceName: "Mike Johnson",
        resourceRole: "Project Manager",
        projectName: "E-commerce Platform",
        totalDays: 18,
        totalHours: 144,
        hourlyRate: 60,
        totalCost: 8640
      }
    ];

    // Filter by project if specified
    if (projectId && projectId !== 'all') {
      return mockData.filter(record => record.projectName.toLowerCase().includes('website'));
    }

    return mockData;
  }
};

export const useAttendanceReport = (month: number, year: number, projectId?: string) => {
  return useQuery({
    queryKey: ['attendanceReport', month, year, projectId],
    queryFn: () => attendanceService.getAttendanceReport(month, year, projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

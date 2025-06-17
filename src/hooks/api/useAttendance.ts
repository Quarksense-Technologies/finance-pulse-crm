
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/api/attendanceService';

interface AttendanceRecord {
  resourceName: string;
  resourceRole: string;
  projectName: string;
  totalDays: number;
  totalHours: number;
  hourlyRate: number;
  totalCost: number;
}

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

export const useProjectAttendance = (projectId: string, month?: number, year?: number) => {
  return useQuery({
    queryKey: ['projectAttendance', projectId, month, year],
    queryFn: () => attendanceService.getProjectAttendance(projectId, month, year),
    enabled: !!projectId,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attendanceService.createAttendance,
    onSuccess: (data, variables) => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendanceReport'] });
      queryClient.invalidateQueries({ queryKey: ['projectAttendance'] });
      
      console.log('Attendance record created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating attendance record:', error);
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      attendanceService.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceReport'] });
      queryClient.invalidateQueries({ queryKey: ['projectAttendance'] });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attendanceService.deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceReport'] });
      queryClient.invalidateQueries({ queryKey: ['projectAttendance'] });
    },
  });
};

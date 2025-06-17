
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, CreateAttendanceData, UpdateAttendanceData } from '@/services/api/attendanceService';

export const useProjectAttendance = (projectId: string, month?: number, year?: number) => {
  return useQuery({
    queryKey: ['attendance', 'project', projectId, month, year],
    queryFn: () => attendanceService.getProjectAttendance(projectId, month, year),
    enabled: !!projectId,
  });
};

export const useAttendanceReport = (month?: number, year?: number, projectId?: string) => {
  return useQuery({
    queryKey: ['attendance', 'report', month, year, projectId],
    queryFn: () => attendanceService.getAttendanceReport(month, year, projectId),
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAttendanceData) => attendanceService.createAttendance(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['attendance', 'project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'report'] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceData }) => 
      attendanceService.updateAttendance(id, data),
    onSuccess: () => {
      // Invalidate all attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attendanceService.deleteAttendance,
    onSuccess: () => {
      // Invalidate all attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/api/companyService';
import { toast } from "@/components/ui/use-toast";

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getCompanies,
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getCompanyById(id),
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companyService.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      companyService.updateCompany(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
